import os
from contextlib import contextmanager

from sqlmodel import Session, SQLModel, create_engine


def _default_sqlite_url() -> str:
    return "sqlite:///./support_crm.db"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", _default_sqlite_url()).strip()


connect_args = {"check_same_thread": False} if get_database_url().startswith("sqlite:///") else {}
engine = create_engine(get_database_url(), echo=False, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


@contextmanager
def session_scope():
    with Session(engine) as session:
        yield session
 
