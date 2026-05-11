from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import ForeignKey, DateTime, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Redemption(Base):
    __tablename__ = "redemptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offer_id: Mapped[str] = mapped_column(String(50), nullable=False)
    voucher_code: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
