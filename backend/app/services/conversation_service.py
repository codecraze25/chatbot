from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Conversation, Message
from app.schemas import ConversationCreate, ConversationUpdate


def list_conversations(db: Session) -> list[Conversation]:
    return (
        db.query(Conversation)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


def get_conversation(db: Session, conversation_id: str) -> Conversation | None:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()


def create_conversation(db: Session, data: ConversationCreate | None = None) -> Conversation:
    payload = data or ConversationCreate()
    conversation = Conversation(title=payload.title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def update_conversation(
    db: Session, conversation: Conversation, data: ConversationUpdate
) -> Conversation:
    conversation.title = data.title
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(conversation)
    return conversation


def delete_conversation(db: Session, conversation: Conversation) -> None:
    db.delete(conversation)
    db.commit()


def add_message(
    db: Session, conversation: Conversation, role: str, content: str
) -> Message:
    message = Message(conversation_id=conversation.id, role=role, content=content)
    conversation.updated_at = datetime.now(timezone.utc)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def auto_title_from_message(conversation: Conversation, message: str) -> None:
    if conversation.title == "New chat":
        conversation.title = message[:50].strip() or "New chat"
