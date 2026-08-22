import uuid
from sqlalchemy import Column, String, Integer, Float, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Stop(Base):
    __tablename__ = "stops"

    id = Column(String(64), primary_key=True, default=lambda: f"stop-{uuid.uuid4().hex[:8]}")
    trip_id = Column(String(64), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = Column(String(64), ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    start_date = Column(String(32), nullable=False) # ISO YYYY-MM-DD
    end_date = Column(String(32), nullable=False)   # ISO YYYY-MM-DD
    notes = Column(Text, default="")
    transport_cost = Column(Float, default=0.0, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    activity_ids = Column(JSON, default=list) # List of Activity ID strings

    trip = relationship("Trip", back_populates="stops")
