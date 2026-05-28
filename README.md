# Support CRM System

A modern, full-stack **Customer Support Ticketing CRM** built for fast issue tracking and easy collaboration.  
This project includes:
- **Backend** with FastAPI, SQLModel, and SQLite
- **Frontend** with React, Vite, and Tailwind CSS
- **Support agent authentication**
- **Ticket assignment, team routing, and attachments**
- **Customer reply tracking**

## Problem Statement

Support teams need a lightweight tool to manage customer requests without heavyweight enterprise systems. Existing solutions can be slow, overly complex, or miss the key workflow for rapid ticket triage, assignment, and follow-up.

## Solution

This project delivers a clean support ticket CRM that is:
- easy to use for agents,
- fast to deploy,
- simple to extend,
- and built as a full stack example with real API and UI integration.

## What makes this project unique

- **Support agent authentication** with token-based headers
- **Ticket assignment and team routing** for realistic help desk workflows
- **Notes with author and visibility metadata** for internal vs customer-facing updates
- **File attachments** on tickets
- **Customer reply tracking** with reply counts and last reply timestamp
- **Search-as-you-type experience** with backend-powered filtering across ticket ID, customer name, email, subject, and description
- **Rich ticket detail view**: update status, change priority, assign agents, upload files, and add notes from one page

## Key UI pages

### 1. Agent Login page

Sign in with your support agent credentials to access the CRM.

<img width="1310" height="830" alt="Agent login page" src="https://github.com/user-attachments/assets/24e2361e-3a8e-411c-aa66-446bd8b099e5" />

### 2. Ticket list page

This page is the main support dashboard:
- Search tickets live
- Filter by status and priority
- View assigned agent and team
- See customer reply count
- Quickly navigate to details or create a new ticket

<img width="1287" height="736" alt="Ticket list page" src="https://github.com/user-attachments/assets/4c03fb91-9bf6-4eaf-9265-deba8c01c67a" />

### 3. New ticket page

A simple form to create a new support request:
- customer name and email
- optional order number
- priority selection
- optional assigned agent and team
- subject and issue description

<img width="1278" height="749" alt="New ticket page" src="https://github.com/user-attachments/assets/0368d97d-c2dd-417e-8263-75a17936925a" />

### 4. Ticket detail page

Inspect and update a ticket:
- see ticket metadata and timestamps
- change status and priority
- reassign an agent or support team
- upload attachments
- add notes with visibility settings
- review note history and file attachments

## How it works

### Backend flow

1. The frontend calls the API under app
2. Support agents authenticate with `POST /api/agents/login`
3. Authenticated requests include:
   - `Authorization: Bearer <token>`
   - `X-Agent-Email: <email>`
4. Tickets are stored in SQLite using SQLModel
5. Ticket updates, notes, and attachments are handled by the API

### Frontend flow

1. The app loads the ticket list from the backend
2. Filters and search terms are applied in the API query
3. Clicking a ticket opens the detail page
4. Agents can update status, priority, assignment, notes, and attachments
5. The app refreshes ticket detail after each update

## Project structure

- backend
  - `app/main.py` — FastAPI application entry point
  - `app/db.py` — database session and connection logic
  - `app/models.py` — SQLModel ORM models for tickets, notes, and attachments
  - `app/schemas.py` — request/response schemas
- frontend
  - `src/App.tsx` — application routes and layout
  - `src/pages/` — page components for list, create, detail, and login
  - `src/lib/api.ts` — API client and types
  - `src/lib/auth.ts` — client-side auth helpers
  - `src/components/` — reusable UI components

## Tech stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, SQLModel, Uvicorn, SQLite
- **Development**: npm for frontend, pip for backend

## Setup instructions

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the backend server:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

## Authentication

This backend uses environment-driven support agent credentials via `SUPPORT_AGENTS`.  
Default built-in agent:

- `Agent email`: `priya@example.com`
- `Agent token`: `support123`

## API endpoints

- `POST /api/agents/login` — authenticate support agents
- `POST /api/tickets` — create a new ticket
- `GET /api/tickets` — list tickets with optional `status`, `priority`, and `search`
- `GET /api/tickets/{ticket_id}` — retrieve a single ticket detail
- `PUT /api/tickets/{ticket_id}` — update ticket status, priority, assignment, team, and notes
- `POST /api/tickets/{ticket_id}/attachments` — upload attachments

## Recommended workflow

1. Start the backend and frontend locally
2. Sign in as an agent
3. Create a new ticket from the form
4. Use search and filters on the ticket list
5. Open a ticket detail view to update status, assignment, notes, or upload attachments

## Notes for improvement

- Add more robust agent roles and session expiration
- Add customer-facing notification/email integration
- Improve attachment validation and file type restrictions
- Add audit history and role-based access controls

## License

This project is provided for learning and support workflow demonstration.
