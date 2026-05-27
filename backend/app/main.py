import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import desc, select

from .db import init_db, session_scope
from .models import Note, Sequence, Ticket
from .schemas import (
    TicketCreateIn,
    TicketCreateOut,
    TicketDetailOut,
    TicketListItem,
    TicketUpdateIn,
    TicketUpdateOut,
)

VALID_STATUSES = {"Open", "In Progress", "Closed"}


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
def create_ticket(payload: TicketCreateIn) -> TicketCreateOut:
    ticket_id = _next_ticket_id()
    now = datetime.utcnow()

    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=payload.customer_name,
        customer_email=str(payload.customer_email),
        subject=payload.subject,
        description=payload.description,
        status="Open",
        created_at=now,
        updated_at=now,
    )

    with session_scope() as session:
        session.add(ticket)
        session.commit()

    return TicketCreateOut(ticket_id=ticket_id, created_at=now)


@app.get("/api/tickets", response_model=list[TicketListItem])
def list_tickets(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> list[TicketListItem]:
    if status is not None and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status filter.")

    stmt = select(Ticket)
    if status:
        stmt = stmt.where(Ticket.status == status)

    if search:
        s = f"%{search.strip()}%"
        stmt = stmt.where(
            (Ticket.ticket_id.ilike(s))
            | (Ticket.customer_name.ilike(s))
            | (Ticket.customer_email.ilike(s))
            | (Ticket.subject.ilike(s))
            | (Ticket.description.ilike(s))
        )

    stmt = stmt.order_by(desc(Ticket.created_at))

    with session_scope() as session:
        tickets = session.exec(stmt).all()

    return [
        TicketListItem(
            ticket_id=t.ticket_id,
            customer_name=t.customer_name,
            subject=t.subject,
            status=t.status,
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

    return TicketDetailOut(
        ticket_id=ticket.ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        notes=[{"note_text": n.note_text, "created_at": n.created_at} for n in notes],
    )


@app.put("/api/tickets/{ticket_id}", response_model=TicketUpdateOut)
def update_ticket(ticket_id: str, payload: TicketUpdateIn) -> TicketUpdateOut:
    if payload.status is not None and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status value.")

    with session_scope() as session:
        ticket = session.exec(select(Ticket).where(Ticket.ticket_id == ticket_id)).first()
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found.")

        changed = False
        if payload.status is not None and payload.status != ticket.status:
            ticket.status = payload.status
            changed = True

        if payload.notes is not None and payload.notes.strip():
            session.add(Note(ticket_id=ticket_id, note_text=payload.notes.strip()))
            changed = True

        if changed:
            ticket.updated_at = datetime.utcnow()
            session.add(ticket)
            session.commit()
            session.refresh(ticket)

    return TicketUpdateOut(success=True, updated_at=ticket.updated_at)
 
