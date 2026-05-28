from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class TicketCreateIn(BaseModel):
    customer_name: str = Field(min_length=1, max_length=200)
    customer_email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10_000)
    order_number: Optional[str] = Field(default=None, max_length=100)
    priority: Optional[str] = Field(default="Medium", description="Low | Medium | High | Urgent")
    assigned_to: Optional[str] = Field(default=None, max_length=200)
    assigned_team: Optional[str] = Field(default=None, max_length=100)


class TicketCreateOut(BaseModel):
    ticket_id: str
    created_at: datetime
    order_number: Optional[str]
    priority: str
    assigned_to: Optional[str]
    assigned_team: Optional[str]


class TicketListItem(BaseModel):
    ticket_id: str
    order_number: Optional[str]
    customer_name: str
    subject: str
    status: str
    priority: str
    assigned_to: Optional[str]
    assigned_team: Optional[str]
    customer_replies_count: int
    created_at: datetime


class NoteOut(BaseModel):
    note_text: str
    author_name: Optional[str]
    author_email: Optional[str]
    visibility: str
    created_at: datetime


class AttachmentOut(BaseModel):
    file_name: str
    content_type: str
    url: str
    uploaded_by: Optional[str]
    created_at: datetime


class TicketDetailOut(BaseModel):
    ticket_id: str
    order_number: Optional[str]
    priority: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: str
    assigned_to: Optional[str]
    assigned_team: Optional[str]
    customer_replies_count: int
    last_customer_reply_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    notes: List[NoteOut]
    attachments: List[AttachmentOut]


class TicketUpdateIn(BaseModel):
    status: Optional[str] = Field(default=None, description="Open | In Progress | Closed")
    priority: Optional[str] = Field(default=None, description="Low | Medium | High | Urgent")
    notes: Optional[str] = Field(default=None, description="Optional note/comment text")
    note_visibility: Optional[str] = Field(default="Internal", description="Internal | Customer")
    assigned_to: Optional[str] = Field(default=None, max_length=200)
    assigned_team: Optional[str] = Field(default=None, max_length=100)


class TicketUpdateOut(BaseModel):
    success: bool
    updated_at: datetime


class AgentLoginIn(BaseModel):
    email: EmailStr
    token: str = Field(min_length=1)


class AgentLoginOut(BaseModel):
    name: str
    email: EmailStr
    team: str
    token: str
 
