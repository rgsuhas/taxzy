from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class ConversationOut(BaseModel):
    conversation_id: int
    messages: list[MessageOut]


class ConversationPreview(BaseModel):
    conversation_id: int
    created_at: datetime
    preview: str
