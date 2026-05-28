import os
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import desc, select

from .db import init_db, session_scope
from .models import Attachment, Note, Sequence, Ticket
from .schemas import (
    AgentLoginIn,
    AgentLoginOut,
    AttachmentOut,
    NoteOut,
    TicketCreateIn,
    TicketCreateOut,
    TicketDetailOut,
    TicketListItem,
    TicketUpdateIn,
    TicketUpdateOut,
)

VALID_STATUSES = {"Open", "In Progress", "Closed"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Urgent"}
VALID_NOTE_VISIBILITIES = {"Internal", "Customer"}


@dataclass
class SupportAgent:
    name: str
    email: str
    token: str
    team: str


def _load_agents() -> list[SupportAgent]:
    raw = os.getenv("SUPPORT_AGENTS", "Priya|priya@example.com|support123|Support").strip()
    agents: list[SupportAgent] = []
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry:
            continue
        parts = [part.strip() for part in entry.split("|")]
        if len(parts) != 4:
            continue
        name, email, token, team = parts
        agents.append(SupportAgent(name=name, email=email, token=token, team=team))
    return agents


AGENTS = _load_agents()


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173").strip()
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(title="Support CRM API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.post("/api/agents/login", response_model=AgentLoginOut)
def login_agent(payload: AgentLoginIn) -> AgentLoginOut:
    agent = next(
        (
            agent
            for agent in AGENTS
            if agent.email.lower() == payload.email.lower() and agent.token == payload.token
        ),
        None,
    )
    if agent is None:
        raise HTTPException(status_code=401, detail="Invalid agent credentials.")

    return AgentLoginOut(name=agent.name, email=agent.email, team=agent.team, token=agent.token)


def _validate_agent(email: str, token: str) -> SupportAgent:
    agent = next(
        (
            agent
            for agent in AGENTS
            if agent.email.lower() == email.lower() and agent.token == token
        ),
        None,
    )
    if agent is None:
        raise HTTPException(status_code=401, detail="Invalid agent credentials.")
    return agent


def get_current_agent(
    authorization: str = Header(...),
    x_agent_email: str = Header(...),
) -> SupportAgent:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token.")

    return _validate_agent(x_agent_email, token)


def _next_ticket_id() -> str:
    with session_scope() as session:
        seq = session.get(Sequence, "tickets")
        if seq is None:
            seq = Sequence(name="tickets", value=0)
            session.add(seq)
            session.commit()
            session.refresh(seq)

        seq.value += 1
        session.add(seq)
        session.commit()
        padded = str(seq.value).zfill(3)
        return f"TKT-{padded}"


@app.post("/api/tickets", response_model=TicketCreateOut)
def create_ticket(payload: TicketCreateIn, agent: SupportAgent = Depends(get_current_agent)) -> TicketCreateOut:
    ticket_id = _next_ticket_id()
    now = datetime.utcnow()
    order_number = payload.order_number or f"ORD-{ticket_id.split('-')[-1]}"
    priority = payload.priority if payload.priority in VALID_PRIORITIES else "Medium"
    assigned_to = payload.assigned_to.strip() if payload.assigned_to else None
    assigned_team = payload.assigned_team.strip() if payload.assigned_team else agent.team

    ticket = Ticket(
        ticket_id=ticket_id,
        order_number=order_number,
        priority=priority,
        customer_name=payload.customer_name,
        customer_email=str(payload.customer_email),
        subject=payload.subject,
        description=payload.description,
        status="Open",
        assigned_to=assigned_to,
        assigned_team=assigned_team,
        customer_replies_count=0,
        last_customer_reply_at=None,
        created_at=now,
        updated_at=now,
    )

    with session_scope() as session:
        session.add(ticket)
        session.commit()

    return TicketCreateOut(
        ticket_id=ticket_id,
        created_at=now,
        order_number=order_number,
        priority=priority,
        assigned_to=assigned_to,
        assigned_team=assigned_team,
    )


@app.get("/api/tickets", response_model=list[TicketListItem])
def list_tickets(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
) -> list[TicketListItem]:
    if status is not None and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status filter.")

    if priority is not None and priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail="Invalid priority filter.")

    stmt = select(Ticket)
    if status:
        stmt = stmt.where(Ticket.status == status)

    if priority:
        stmt = stmt.where(Ticket.priority == priority)

    if search:
        s = f"%{search.strip()}%"
        stmt = stmt.where(
            (Ticket.ticket_id.ilike(s))
            | (Ticket.order_number.ilike(s))
            | (Ticket.customer_name.ilike(s))
            | (Ticket.customer_email.ilike(s))
            | (Ticket.subject.ilike(s))
            | (Ticket.description.ilike(s))
            | (Ticket.assigned_to.ilike(s))
            | (Ticket.assigned_team.ilike(s))
        )

    stmt = stmt.order_by(desc(Ticket.created_at))

    with session_scope() as session:
        tickets = session.exec(stmt).all()

    return [
        TicketListItem(
            ticket_id=t.ticket_id,
            order_number=t.order_number,
            customer_name=t.customer_name,
            subject=t.subject,
            status=t.status,
            priority=t.priority,
            assigned_to=t.assigned_to,
            assigned_team=t.assigned_team,
            customer_replies_count=t.customer_replies_count,
            created_at=t.created_at,
        )
        for t in tickets
    ]


@app.get("/api/tickets/{ticket_id}", response_model=TicketDetailOut)
def get_ticket(ticket_id: str) -> TicketDetailOut:
    with session_scope() as session:
        ticket = session.exec(select(Ticket).where(Ticket.ticket_id == ticket_id)).first()
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        notes = session.exec(
            select(Note).where(Note.ticket_id == ticket_id).order_by(desc(Note.created_at))
        ).all()
        attachments = session.exec(
            select(Attachment).where(Attachment.ticket_id == ticket_id).order_by(desc(Attachment.created_at))
        ).all()

    return TicketDetailOut(
        ticket_id=ticket.ticket_id,
        order_number=ticket.order_number,
        priority=ticket.priority,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        assigned_to=ticket.assigned_to,
        assigned_team=ticket.assigned_team,
        customer_replies_count=ticket.customer_replies_count,
        last_customer_reply_at=ticket.last_customer_reply_at,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        notes=[
            {
                "note_text": n.note_text,
                "author_name": n.author_name,
                "author_email": n.author_email,
                "visibility": n.visibility,
                "created_at": n.created_at,
            }
            for n in notes
        ],
        attachments=[
            {
                "file_name": a.file_name,
                "content_type": a.content_type,
                "url": a.url,
                "uploaded_by": a.uploaded_by,
                "created_at": a.created_at,
            }
            for a in attachments
        ],
    )


@app.put("/api/tickets/{ticket_id}", response_model=TicketUpdateOut)
def update_ticket(
    ticket_id: str,
    payload: TicketUpdateIn,
    agent: SupportAgent = Depends(get_current_agent),
) -> TicketUpdateOut:
    if payload.status is not None and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status value.")
    if payload.priority is not None and payload.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail="Invalid priority value.")
    if payload.note_visibility is not None and payload.note_visibility not in VALID_NOTE_VISIBILITIES:
        raise HTTPException(status_code=400, detail="Invalid note visibility.")

    with session_scope() as session:
        ticket = session.exec(select(Ticket).where(Ticket.ticket_id == ticket_id)).first()
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        changed = False
        if payload.assigned_to is not None and payload.assigned_to.strip() != (ticket.assigned_to or ""):
            old_assigned = ticket.assigned_to or "Unassigned"
            ticket.assigned_to = payload.assigned_to.strip() or None
            session.add(
                Note(
                    ticket_id=ticket_id,
                    note_text=f"Assigned to {ticket.assigned_to or 'unassigned'} (was {old_assigned})",
                    author_name=agent.name,
                    author_email=agent.email,
                    visibility="Internal",
                )
            )
            changed = True

        if payload.assigned_team is not None and payload.assigned_team.strip() != (ticket.assigned_team or ""):
            old_team = ticket.assigned_team or "Unassigned"
            ticket.assigned_team = payload.assigned_team.strip() or None
            session.add(
                Note(
                    ticket_id=ticket_id,
                    note_text=f"Routed to team {ticket.assigned_team or 'unassigned'} (was {old_team})",
                    author_name=agent.name,
                    author_email=agent.email,
                    visibility="Internal",
                )
            )
            changed = True

        if payload.priority is not None and payload.priority != ticket.priority:
            old_priority = ticket.priority
            ticket.priority = payload.priority
            session.add(
                Note(
                    ticket_id=ticket_id,
                    note_text=f"Priority changed from {old_priority} to {payload.priority}",
                    author_name=agent.name,
                    author_email=agent.email,
                    visibility="Internal",
                )
            )
            changed = True

        if payload.status is not None and payload.status != ticket.status:
            old_status = ticket.status
            ticket.status = payload.status
            session.add(
                Note(
                    ticket_id=ticket_id,
                    note_text=f"Status changed from {old_status} to {payload.status}",
                    author_name=agent.name,
                    author_email=agent.email,
                    visibility="Internal",
                )
            )
            changed = True

        if payload.notes is not None and payload.notes.strip():
            visibility = payload.note_visibility or "Internal"
            session.add(
                Note(
                    ticket_id=ticket_id,
                    note_text=payload.notes.strip(),
                    author_name=agent.name,
                    author_email=agent.email,
                    visibility=visibility,
                )
            )
            if visibility == "Customer":
                ticket.customer_replies_count += 1
                ticket.last_customer_reply_at = datetime.utcnow()
            changed = True

        if changed:
            ticket.updated_at = datetime.utcnow()
            session.add(ticket)
            session.commit()
            session.refresh(ticket)

    return TicketUpdateOut(success=True, updated_at=ticket.updated_at)


@app.post("/api/tickets/{ticket_id}/attachments", response_model=AttachmentOut)
def upload_ticket_attachment(
    ticket_id: str,
    file: UploadFile = File(...),
    agent: SupportAgent = Depends(get_current_agent),
) -> AttachmentOut:
    with session_scope() as session:
        ticket = session.exec(select(Ticket).where(Ticket.ticket_id == ticket_id)).first()
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found.")

    uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    filename = Path(file.filename).name
    saved_name = f"{ticket_id}_{uuid4().hex}_{filename}"
    saved_path = uploads_dir / saved_name
    with saved_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = Attachment(
        ticket_id=ticket_id,
        file_name=filename,
        content_type=file.content_type or "application/octet-stream",
        url=f"/uploads/{saved_name}",
        uploaded_by=agent.email,
        created_at=datetime.utcnow(),
    )

    with session_scope() as session:
        session.add(attachment)
        session.commit()
        session.refresh(attachment)

    return AttachmentOut(
        file_name=attachment.file_name,
        content_type=attachment.content_type,
        url=attachment.url,
        uploaded_by=attachment.uploaded_by,
        created_at=attachment.created_at,
    )


uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

frontend_dist = Path(__file__).resolve().parent.parent / "frontend_dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
 
