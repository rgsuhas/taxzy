from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import ForeignKey, DateTime, String, LargeBinary, JSON
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(30), nullable=False)  # form16_pdf|ais_json|itr_xml|form26as_pdf
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_blob: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    parsed_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
