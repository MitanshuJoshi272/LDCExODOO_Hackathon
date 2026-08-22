from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey
from app.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(64), primary_key=True, index=True)
    city_id = Column(String(64), ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False, index=True) # Food, Culture, Nature, Nightlife, Adventure
    duration_hours = Column(Float, nullable=False, default=2.0)
    cost = Column(Float, nullable=False, default=0.0)
    description = Column(Text, nullable=False)
