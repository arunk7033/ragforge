import asyncio
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.auth import User, current_user
from app.schemas import ChatRequest

router = APIRouter(prefix="/v1/chat", tags=["chat"])

TOKEN_DELAY_SECONDS = 0.03


def placeholder_reply(question: str) -> str:
    preview = question if len(question) <= 200 else question[:200] + "…"
    return (
        "This is a placeholder response from the ragforge backend. "
        "Retrieval and generation aren't connected yet, so no documents were searched "
        "and no model was called.\n\n"
        f"You asked: \"{preview}\""
    )


async def _stream_words(text: str) -> AsyncIterator[str]:
    words = text.split(" ")
    for i, word in enumerate(words):
        yield word if i == len(words) - 1 else word + " "
        await asyncio.sleep(TOKEN_DELAY_SECONDS)


@router.post("/stream")
async def stream_chat(body: ChatRequest, user: User = Depends(current_user)) -> StreamingResponse:
    """Stream an assistant reply as plain text chunks."""
    last = body.messages[-1]
    if last.role != "user":
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Last message must be from the user")
    return StreamingResponse(
        _stream_words(placeholder_reply(last.content)),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )
