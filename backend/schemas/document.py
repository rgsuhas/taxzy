from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentOut(BaseModel):
    doc_id: int
    doc_type: str
    filename: str
    uploaded_at: datetime


class DocumentDetail(BaseModel):
    doc_id: int
    doc_type: str
    parsed_data: Optional[dict]
    uploaded_at: datetime


class UploadResponse(BaseModel):
    doc_id: int
    doc_type: str
    extracted_fields: dict
    merged_into_profile: bool
