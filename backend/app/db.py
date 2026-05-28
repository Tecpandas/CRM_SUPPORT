import os
from contextlib import contextmanager
from pathlib import Path

from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine


def _default_sqlite_url() -> str:
    return "sqlite:///./support_crm.db"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", _default_sqlite_url()).strip()


connect_args = {"check_same_thread": False} if get_database_url().startswith("sqlite:///") else {}
engine = create_engine(get_database_url(), echo=False, connect_args=connect_args)


def _column_exists(table_name: str, column_name: str) -> bool:
    with engine.connect() as conn:
        result = conn.execute(text(f"PRAGMA table_info({table_name})"))
        return any(row[1] == column_name for row in result)


def _ensure_sqlite_columns() -> None:
    # SQLite does not alter existing tables during create_all, so add missing columns manually.
    if get_database_url().startswith("sqlite:///"):
        columns = {
            "ticket": [
                ("priority", "TEXT DEFAULT 'Medium'"),
                ("order_number", "TEXT"),
                ("assigned_to", "TEXT"),
                ("assigned_team", "TEXT"),
                ("customer_replies_count", "INTEGER DEFAULT 0"),
                ("last_customer_reply_at", "TEXT"),
            ],
            "note": [
                ("author_name", "TEXT"),
                ("author_email", "TEXT"),
                ("visibility", "TEXT DEFAULT 'Internal'"),
            ],
        }

        with engine.connect() as conn:
            for table_name, items in columns.items():
                for column_name, column_type in items:
                    if not _column_exists(table_name, column_name):
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    _ensure_sqlite_columns()
    upload_dir = Path(__file__).resolve().parent.parent / "uploads"
    upload_dir.mkdir(exist_ok=True)


@contextmanager
def session_scope():
    with Session(engine) as session:
        yield session
 
