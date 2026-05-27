## Support CRM Backend (FastAPI + SQLite)

### Setup

```powershell
cd support-crm\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

### Run

```powershell
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`.

