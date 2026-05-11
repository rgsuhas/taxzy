from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import get_current_user
from models.document import Document
from models.tax_profile import TaxProfile
from models.user import User
from schemas.document import DocumentOut, DocumentDetail, UploadResponse
from services.document_parser import detect_doc_type, parse_document, merge_into_profile

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await file.read()
    detected_type = doc_type or detect_doc_type(file.filename or "", file.content_type or "")

    parsed = parse_document(data, detected_type)

    doc = Document(
        user_id=current_user.id,
        doc_type=detected_type,
        filename=file.filename or "upload",
        raw_blob=data,
        parsed_data=parsed,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    profile = db.query(TaxProfile).filter(TaxProfile.user_id == current_user.id).first()
    merged = False
    if profile:
        merge_into_profile(parsed, profile)
        db.commit()
        merged = True

    return UploadResponse(doc_id=doc.id, doc_type=detected_type, extracted_fields=parsed, merged_into_profile=merged)


@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()
    return [DocumentOut(doc_id=d.id, doc_type=d.doc_type, filename=d.filename, uploaded_at=d.uploaded_at) for d in docs]


@router.get("/{doc_id}", response_model=DocumentDetail)
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentDetail(doc_id=doc.id, doc_type=doc.doc_type, parsed_data=doc.parsed_data, uploaded_at=doc.uploaded_at)


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
