from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import ForeignKey, DateTime, String, Numeric, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class TaxProfile(Base):
    __tablename__ = "tax_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    pan: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    pan_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    dob: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    filing_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # salaried|freelancer|both
    ay: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # e.g. "2024-25"
    gross_income: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    tds_paid: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    other_income: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    deductions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    regime: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # "old" | "new"
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
