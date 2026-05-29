<div align="center">

# 🎫 Support CRM — Backend API

**FastAPI · SQLite · Docker · Render**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

A lightweight, production-ready backend for the **Support CRM System** — built to help support teams create, assign, track, and resolve customer tickets with speed and clarity.

[🌐 Live Demo](https://crm-support-2.onrender.com) · [📦 Frontend Repo](#) · [📹 Demo Video](https://youtu.be/wUVMvRBghDI?si=vQRTH60a5LAnFBnc)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Authentication](#-authentication)
- [Notes System](#-notes-system)
- [File Attachments](#-file-attachments)
- [Docker Setup](#-docker-setup)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🔍 Overview

The Support CRM Backend powers a full customer support workflow — from ticket creation to resolution. It provides a clean REST API consumed by the React frontend, with support for agent authentication, priority triage, team assignment, smart notes, and file uploads.

> **This is a real system.** It runs on actual servers and handles real data — built for production, not just demos.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Agent Authentication** | Email + token login with `Authorization` header support |
| 🎫 **Auto Ticket Generation** | Unique IDs like `TKT-001`, `TKT-002` — no manual numbering |
| 📦 **Auto Order Numbers** | Auto-generates `ORD-001` style order IDs when not provided |
| ⚡ **Priority Management** | Four levels: `Low` · `Medium` · `High` · `Urgent` |
| 👥 **Team Assignment** | Assign tickets to individual agents or entire teams |
| 📝 **Smart Notes** | Internal (agent-only) and Customer-visible notes |
| 📎 **File Attachments** | Upload and serve files per ticket with collision-safe storage |
| 🔄 **Reply Tracking** | Tracks customer reply counts to surface active conversations |
| 🔎 **Search & Filter** | Filter by `status`, `priority`, `search` across name/email/subject |
| 📊 **Status Lifecycle** | `Open` → `In Progress` → `Closed` |

---

## 🛠 Tech Stack
Backend     →  FastAPI (Python 3.10+)
Database    →  SQLite 3 (file-based, zero-config)
Auth        →  Environment-driven agent credentials (Bearer token)
File Store  →  Local uploads/ directory, served via /uploads
Container   →  Docker + Docker Compose
Deploy      →  Render (Web Service)

---

## 📁 Project Structure
backend/
├── app/
│   ├── main.py              # App entry point, CORS, router registration
│   ├── database.py          # SQLite connection & table initialization
│   ├── models.py            # Pydantic request/response schemas
│   ├── auth.py              # Agent credential validation
│   └── routers/
│       ├── agents.py        # POST /api/agents/login
│       ├── tickets.py       # CRUD ticket endpoints
│       └── attachments.py   # File upload & serving
├── uploads/                 # Uploaded attachment files (gitignored)
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container definition
├── docker-compose.yml       # Local multi-service setup
└── README.md

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Tecpandas/CRM_SUPPORT.git
cd CRM_SUPPORT/backend
```

### 2. Create and activate a virtual environment

**Windows (PowerShell)**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 5. Run the development server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be live at **`http://localhost:8000`**

Interactive docs available at **`http://localhost:8000/docs`** (Swagger UI)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Agent credentials (comma-separated for multiple agents)
# Format: email:token,email:token
SUPPORT_AGENTS=priya@example.com:support123

# Upload directory (relative to project root)
UPLOAD_DIR=uploads
```

> **Default agent for testing:**
> - Email: `priya@example.com`
> - Token: `support123`

---

## 📡 API Reference

Base URL: `https://crm-support-2.onrender.com` (production) · `http://localhost:8000` (local)

### Agents

#### `POST /api/agents/login`
Authenticate a support agent and retrieve their metadata.

**Request Body**
```json
{
  "email": "priya@example.com",
  "token": "support123"
}
```

**Response `200 OK`**
```json
{
  "email": "priya@example.com",
  "name": "Priya",
  "authenticated": true
}
```

---

### Tickets

> ⚠️ All ticket endpoints require the following headers:
> ```
> Authorization: Bearer <token>
> X-Agent-Email: <email>
> ```

---

#### `POST /api/tickets`
Create a new support ticket.

**Request Body**
```json
{
  "customer_name": "Rahul Sharma",
  "customer_email": "rahul@example.com",
  "subject": "Order not received",
  "description": "I placed order #1023 five days ago and haven't received it yet.",
  "priority": "High"
}
```

**Response `201 Created`**
```json
{
  "ticket_id": "TKT-004",
  "order_number": "ORD-004",
  "created_at": "2026-05-29T10:32:00Z"
}
```

---

#### `GET /api/tickets`
Retrieve all tickets. Supports optional query filters.

| Query Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `Open`, `In Progress`, or `Closed` |
| `priority` | string | Filter by `Low`, `Medium`, `High`, or `Urgent` |
| `search` | string | Search across name, email, subject, description |

**Response `200 OK`**
```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "Rahul Sharma",
    "subject": "Order not received",
    "status": "Open",
    "priority": "High",
    "created_at": "2026-05-29T10:32:00Z"
  }
]
```

---

#### `GET /api/tickets/{ticket_id}`
Retrieve full details for a single ticket including notes.

**Response `200 OK`**
```json
{
  "ticket_id": "TKT-001",
  "customer_name": "Rahul Sharma",
  "customer_email": "rahul@example.com",
  "subject": "Order not received",
  "description": "I placed order #1023...",
  "status": "In Progress",
  "priority": "High",
  "assigned_to": "priya@example.com",
  "assigned_team": "Tier 1 Support",
  "customer_reply_count": 2,
  "notes": [
    {
      "id": 1,
      "note_text": "Checked with warehouse — shipment delayed.",
      "note_type": "Internal",
      "created_at": "2026-05-29T11:00:00Z"
    }
  ],
  "created_at": "2026-05-29T10:32:00Z",
  "updated_at": "2026-05-29T11:00:00Z"
}
```

---

#### `PUT /api/tickets/{ticket_id}`
Update a ticket's status, priority, assignment, or add a note.

**Request Body** *(all fields optional)*
```json
{
  "status": "In Progress",
  "priority": "Urgent",
  "assigned_to": "priya@example.com",
  "assigned_team": "Tier 1 Support",
  "note": {
    "note_text": "Customer has been contacted.",
    "note_type": "Internal"
  }
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "updated_at": "2026-05-29T12:15:00Z"
}
```

---

#### `POST /api/tickets/{ticket_id}/attachments`
Upload a file attachment for a ticket.

**Request:** `multipart/form-data` with `file` field.

**Response `200 OK`**
```json
{
  "filename": "screenshot_a3f2c1.png",
  "url": "/uploads/screenshot_a3f2c1.png"
}
```

---

## 🔐 Authentication

This backend uses a **stateless, environment-driven credential system**. Agent credentials are defined in `SUPPORT_AGENTS` and validated on every protected request.

**How to authenticate:**

1. Call `POST /api/agents/login` with email and token
2. Use the token in all subsequent requests:

```http
Authorization: Bearer support123
X-Agent-Email: priya@example.com
```

> For production, consider upgrading to JWT tokens (see [Roadmap](#-roadmap)).

---

## 📝 Notes System

Notes support two visibility scopes:

| Type | Visible To |
|---|---|
| `Internal` | Support agents only — never exposed to customers |
| `Customer` | Surfaced in customer-facing views and reply tracking |

Customer notes also increment the `customer_reply_count` field on the ticket, helping agents identify active and unresolved conversations at a glance.

---

## 📎 File Attachments

- Uploaded files are stored in the `uploads/` directory
- Filenames are made collision-safe using a unique hash suffix
- Files are served statically at `/uploads/<filename>`
- Supported: any file type (images, PDFs, logs, etc.)

> `uploads/` is listed in `.gitignore` — files are not committed to version control.

---

## 🐳 Docker Setup

### Build and run with Docker Compose

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

### Build the image manually

```bash
docker build -t crm-backend .
docker run -p 8000:8000 --env-file .env crm-backend
```

---

## ☁️ Deployment

This backend is deployed on **[Render](https://render.com)** as a Docker Web Service.

### Steps to deploy your own instance

1. Push your repository to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repo
4. Set **Environment** to `Docker`
5. Add environment variables from `.env.example`
6. Deploy 🚀

> **Note on SQLite persistence:** Render's free tier has ephemeral storage. For persistence across deploys, configure a [Render Disk](https://render.com/docs/disks) or migrate to PostgreSQL.

---

## 🗺 Roadmap

- [ ] JWT-based authentication with refresh tokens
- [ ] Role-based access control (Admin / Agent / Viewer)
- [ ] Email notifications on ticket creation and status change
- [ ] WebSocket support for real-time ticket updates
- [ ] Admin analytics dashboard (ticket volume, resolution time, agent load)
- [ ] PostgreSQL migration for production-grade persistence
- [ ] Pagination on `GET /api/tickets`
- [ ] Rate limiting and request throttling

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ using FastAPI · Deployed on Render
</div>
