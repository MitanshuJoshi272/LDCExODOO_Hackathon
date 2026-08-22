import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(64), primary_key=True, default=lambda: f"trip-{uuid.uuid4().hex[:8]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    cover_image = Column(String(512), default="")
    start_date = Column(String(32), nullable=False) # ISO YYYY-MM-DD
    budget_cap = Column(Float, nullable=False, default=3000.0)
    travelers = Column(Integer, nullable=False, default=1)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stops = relationship("Stop", back_populates="trip", cascade="all, delete-orphan", order_by="Stop.order_index")
