## Support CRM System (Ticketing)

A lightweight **Customer Support Ticketing CRM** built as a full-stack web app (DB + API + frontend).
It’s intentionally simple (2 tables) but feels like a real internal tool: fast search, status workflow, and notes for collaboration.

### What makes it unique (beyond the assignment)
- **Instant search-as-you-type** with server-side matching across *ID, name, email, subject, description*
- **Quick operations UX**: copy ticket ID, clear empty states, and friendly feedback (toasts)
- **Operational visibility**: a small dashboard summary (Total / Open / In Progress / Closed)
- **Simple but real data model**: `tickets` + `notes` (no over-engineering)

### Tech stack
- **Backend**: FastAPI + SQLModel + SQLite (`support-crm/backend`)
- **Frontend**: React + Tailwind + Vite (`support-crm/frontend`)

### Core features (matches assignment)
- Create tickets (auto `TKT-001` IDs + timestamps)
- List all tickets (clean list view: ID, Name, Title, Status, Date)
- Search functionality (quick search across key fields)
- Filter by status (Open / In Progress / Closed)
- View & update tickets (detail view, update status, add notes/comments)

---

## Local development

### 1) Run backend

```powershell
cd support-crm\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2) Run frontend

Open a new terminal:

```powershell
cd support-crm\frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000`

---

## How it works (high level)

- **Ticket IDs**: backend generates sequential IDs like `TKT-001`, `TKT-002` using a tiny `sequence` table.
- **Search & filter**: `GET /api/tickets` supports `status` + `search` query params and returns a compact list payload for fast rendering.
- **Notes**: `PUT /api/tickets/{ticket_id}` can update status and optionally append a note (stored in `notes` table).

---

## Database schema (2 tables)

### `tickets`
`ticket_id` (unique), customer fields, subject/description, status, created/updated timestamps.

### `notes`
Appended notes per ticket (`ticket_id` FK-ish string), note text, created timestamp.

---

## API (required endpoints)

- `POST /api/tickets`
- `GET /api/tickets?status=Open&search=foo`
- `GET /api/tickets/{ticket_id}`
- `PUT /api/tickets/{ticket_id}`

---

## Demo video plan (3–5 min)
- Show Home → create 2–3 tickets
- Show **search-as-you-type** (search by email / subject keyword)
- Show **filter by status**
- Open a ticket → change status → add a note → show notes list updated
- Brief code walkthrough:
  - backend: `support-crm/backend/app/main.py`
  - frontend: `support-crm/frontend/src/pages/*`

---

## Deployment (quick path)

### Backend on Railway
- Create a Railway project from the repo
- Set root directory to `support-crm/backend`
- Add env vars:
  - `DATABASE_URL=sqlite:///./support_crm.db`
  - `CORS_ORIGINS=<your-frontend-url>`
- Start command:
  - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend on Vercel
- Import repo in Vercel
- Set root directory to `support-crm/frontend`
- Add env var:
  - `VITE_API_BASE_URL=<your-railway-backend-url>`

