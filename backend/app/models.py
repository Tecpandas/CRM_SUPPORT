from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True, unique=True)

    customer_name: str
    customer_email: str = Field(index=True)

    subject: str
    description: str

    status: str = Field(default="Open", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True)
    note_text: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Sequence(SQLModel, table=True):
    """
    Minimal sequence table to generate TKT-001 style IDs.
    """

    name: str = Field(primary_key=True)
    value: int = Field(default=0)
 
