from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    chat_id: str | None = None
    messages: list[ChatMessage] = Field(min_length=1, max_length=100)


class DocumentOut(BaseModel):
    id: str
    filename: str
    size_bytes: int
    content_type: str | None
    status: str
    created_at: datetime


class Limits(BaseModel):
    max_files: int
    max_total_bytes: int
    allowed_extensions: list[str]


class Usage(BaseModel):
    files: int
    total_bytes: int


class MeOut(BaseModel):
    id: str
    email: str | None
    limits: Limits
    usage: Usage
