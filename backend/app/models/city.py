from sqlalchemy import Column, String, Integer, Float, Text, JSON
from app.database import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    country = Column(String(128), nullable=False, index=True)
    region = Column(String(64), nullable=False, index=True)
    image = Column(String(512), nullable=False)
    blurb = Column(Text, nullable=False)
    lodging_per_night = Column(Float, nullable=False, default=100.0)
    daily_living_cost = Column(Float, nullable=False, default=50.0)
    cost_index = Column(Integer, nullable=False, default=3) # 1 to 5
    popularity = Column(Integer, nullable=False, default=80) # 0 to 100
    tags = Column(JSON, default=list)
