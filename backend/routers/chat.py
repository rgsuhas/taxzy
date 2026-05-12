import json
import logging
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.conversation import Conversation
from models.message import Message
from models.tax_profile import TaxProfile
from models.user import User
from schemas.chat import ChatRequest, ConversationOut, ConversationPreview, MessageOut
from services.gemini import extract_tax_fields, stream_chat

logger = logging.getLogger("taxzy.chat")
router = APIRouter(prefix="/api/chat", tags=["chat"])


def _get_or_create_conversation(db: Session, user_id: int, conversation_id: Optional[int]) -> Conversation:
    if conversation_id:
        conv = db.get(Conversation, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv
    conv = Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def _build_profile_dict(profile: Optional[TaxProfile]) -> Optional[dict]:
    if not profile:
        return None
    return {
        "gross_income": float(profile.gross_income) if profile.gross_income else None,
        "tds_paid": float(profile.tds_paid) if profile.tds_paid else None,
        "deductions": profile.deductions,
        "regime": profile.regime,
        "filing_type": profile.filing_type,
    }


@router.post("")
async def post_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t_request = time.perf_counter()
    conv = _get_or_create_conversation(db, current_user.id, body.conversation_id)
    is_new_conv = body.conversation_id is None

    logger.info(
        "chat request | user_id=%d conv_id=%d new=%s msg_len=%d",
        current_user.id, conv.id, is_new_conv, len(body.message),
    )

    user_msg = Message(conversation_id=conv.id, role="user", content=body.message)
    db.add(user_msg)
    db.commit()

    history = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    messages = [{"role": m.role, "content": m.content} for m in history]

    profile = db.query(TaxProfile).filter(TaxProfile.user_id == current_user.id).first()
    profile_dict = _build_profile_dict(profile)

    async def generate():
        full_text = ""
        yield f"data: {json.dumps({'type': 'conversation_id', 'conversation_id': conv.id})}\n\n"

        try:
            async for chunk in stream_chat(messages, profile_dict):
                full_text += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
        except Exception:
            logger.exception("stream_chat failed | user_id=%d conv_id=%d", current_user.id, conv.id)
            yield f"data: {json.dumps({'type': 'error', 'message': 'Something went wrong. Please try again.'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        assistant_msg = Message(conversation_id=conv.id, role="assistant", content=full_text)
        db.add(assistant_msg)
        db.commit()

        extracted = await extract_tax_fields(full_text, body.message)
        has_fields = any(v is not None for v in extracted.values())
        if has_fields:
            if not profile:
                new_profile = TaxProfile(user_id=current_user.id)
                db.add(new_profile)
                db.commit()
                db.refresh(new_profile)
                _merge_extracted(new_profile, extracted, db)
            else:
                _merge_extracted(profile, extracted, db)
            logger.info("profile updated | user_id=%d fields=%s", current_user.id, [k for k, v in extracted.items() if v is not None])
            yield f"data: {json.dumps({'type': 'structured_update', 'fields': extracted})}\n\n"

        elapsed = time.perf_counter() - t_request
        logger.info("chat done | user_id=%d conv_id=%d reply_len=%d elapsed=%.2fs", current_user.id, conv.id, len(full_text), elapsed)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


def _merge_extracted(profile: TaxProfile, fields: dict, db: Session):
    if fields.get("income") is not None:
        profile.gross_income = fields["income"]
    if fields.get("tds") is not None:
        profile.tds_paid = fields["tds"]
    if fields.get("pan") is not None:
        profile.pan = fields["pan"]
    if fields.get("filing_type") is not None:
        profile.filing_type = fields["filing_type"]
    if fields.get("deductions"):
        existing = profile.deductions or {}
        existing.update({k: v for k, v in fields["deductions"].items() if v is not None})
        profile.deductions = existing
    db.commit()


@router.get("/history", response_model=list[ConversationPreview])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )
    result = []
    for conv in conversations:
        first_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id, Message.role == "user")
            .order_by(Message.created_at)
            .first()
        )
        preview = (first_msg.content[:80] + "...") if first_msg and len(first_msg.content) > 80 else (first_msg.content if first_msg else "")
        result.append(ConversationPreview(conversation_id=conv.id, created_at=conv.created_at, preview=preview))
    return result


@router.get("/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conv = db.get(Conversation, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    return ConversationOut(
        conversation_id=conv.id,
        messages=[MessageOut(id=m.id, role=m.role, content=m.content, created_at=m.created_at) for m in messages],
    )


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conv = db.get(Conversation, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}
