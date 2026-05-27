from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class TicketCreateIn(BaseModel):
    customer_name: str = Field(min_length=1, max_length=200)
    customer_email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10_000)


class TicketCreateOut(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime


class NoteOut(BaseModel):
    note_text: str
    created_at: datetime


class TicketDetailOut(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteOut]


class TicketUpdateIn(BaseModel):
    status: Optional[str] = Field(default=None, description="Open | In Progress | Closed")
    notes: Optional[str] = Field(default=None, description="Optional note/comment text")


class TicketUpdateOut(BaseModel):
    success: bool
    updated_at: datetime
 
