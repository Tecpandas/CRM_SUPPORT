from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True, unique=True)

    order_number: Optional[str] = Field(default=None, index=True)
    priority: str = Field(default="Medium", index=True)
    status: str = Field(default="Open", index=True)

    customer_name: str
    customer_email: str = Field(index=True)

    subject: str
    description: str

    assigned_to: Optional[str] = Field(default=None, index=True)
    assigned_team: Optional[str] = Field(default=None, index=True)

    customer_replies_count: int = Field(default=0, index=True)
    last_customer_reply_at: Optional[datetime] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True)
    note_text: str
    author_name: Optional[str] = Field(default=None)
    author_email: Optional[str] = Field(default=None)
    visibility: str = Field(default="Internal", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Attachment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True)
    file_name: str
    content_type: str
    url: str
    uploaded_by: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Sequence(SQLModel, table=True):
    """
    Minimal sequence table to generate TKT-001 style IDs.
    """

    name: str = Field(primary_key=True)
    value: int = Field(default=0)
 
