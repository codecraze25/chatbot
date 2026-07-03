from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class MessageCreate(BaseModel):
    role: MessageRole
    content: str = Field(..., min_length=1, max_length=8000)


class MessageResponse(BaseModel):
    id: str
    role: MessageRole
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    title: str = "New chat"


class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetail(ConversationSummary):
    messages: list[MessageResponse]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
