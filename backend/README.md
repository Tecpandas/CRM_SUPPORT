## Support CRM Backend (FastAPI + SQLite)

A lightweight backend for the Support CRM app with agent authentication, ticket assignment, attachment upload, and reply tracking.

### Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Run

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`.

### Authentication

This backend uses environment-driven support agent credentials via `SUPPORT_AGENTS`.
The default configured agent is:

- `Agent email`: `priya@example.com`
- `Agent token`: `support123`

Use `POST /api/agents/login` with those credentials to obtain agent auth for later requests.

### API endpoints

- `POST /api/agents/login` — authenticate agent credentials and return agent metadata
- `POST /api/tickets` — create a new ticket
- `GET /api/tickets` — list tickets with optional `status`, `priority`, and `search`
- `GET /api/tickets/{ticket_id}` — retrieve a single ticket detail
- `PUT /api/tickets/{ticket_id}` — update ticket status, priority, assignment, team, and notes
- `POST /api/tickets/{ticket_id}/attachments` — upload file attachments for a ticket

### Notes

- Ticket requests require `Authorization: Bearer <token>` and `X-Agent-Email: <email>` headers.
- Attachments are stored in the backend `uploads/` directory and served from `/uploads`.
- Notes support `Internal` and `Customer` visibility and can increment customer reply metrics.

