from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Conversation
from app.schemas import ChatRequest, MessageRole
from app.services import conversation_service
from app.services.ai import get_ai_provider
from app.services.ai.base import ChatMessage
from app.utils.sse import format_sse

router = APIRouter(tags=["chat"])


def build_ai_messages(conversation: Conversation) -> list[ChatMessage]:
    messages: list[ChatMessage] = [{"role": "system", "content": settings.system_prompt}]
    history = conversation.messages[-settings.max_context_messages :]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    return messages


async def chat_stream(
    db: Session,
    conversation_id: str,
    user_message: str,
) -> AsyncIterator[str]:
    conversation = conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        yield format_sse("error", {"detail": "Conversation not found"})
        return

    conversation_service.add_message(db, conversation, MessageRole.user.value, user_message)
    conversation_service.auto_title_from_message(db, conversation, user_message)

    conversation = conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        yield format_sse("error", {"detail": "Conversation not found"})
        return

    try:
        provider = get_ai_provider()
    except ValueError as exc:
        yield format_sse("error", {"detail": str(exc)})
        return

    ai_messages = build_ai_messages(conversation)
    full_response: list[str] = []

    try:
        async for token in provider.stream(ai_messages):
            full_response.append(token)
            yield format_sse("token", {"content": token})
    except Exception as exc:
        yield format_sse("error", {"detail": str(exc)})
        return

    assistant_message = conversation_service.add_message(
        db,
        conversation,
        MessageRole.assistant.value,
        "".join(full_response),
    )
    yield format_sse("done", {"message_id": assistant_message.id})


@router.post("/conversations/{conversation_id}/chat")
async def send_message(
    conversation_id: str,
    body: ChatRequest,
    db: Session = Depends(get_db),
):
    conversation = conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if len(body.message) > settings.max_message_length:
        raise HTTPException(status_code=400, detail="Message too long")

    return StreamingResponse(
        chat_stream(db, conversation_id, body.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
