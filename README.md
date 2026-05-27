## Support CRM System (Ticketing)

Full-stack customer support ticketing CRM:
- **Backend**: FastAPI + SQLite (`support-crm/backend`)
- **Frontend**: React + Tailwind (Vite) (`support-crm/frontend`)

### Features (matches assignment)
- Create tickets (auto `TKT-001` style IDs + timestamps)
- List tickets (clean list view)
- Search (ID, name, email, subject, description)
- Filter by status (Open / In Progress / Closed)
- View & update tickets (status + notes/comments)

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

## API (required endpoints)

- `POST /api/tickets`
- `GET /api/tickets?status=Open&search=foo`
- `GET /api/tickets/{ticket_id}`
- `PUT /api/tickets/{ticket_id}`

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

