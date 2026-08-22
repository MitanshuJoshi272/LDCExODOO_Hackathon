import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    avatar = Column(String(32), default="US")
    language = Column(String(64), default="English")
    role = Column(String(32), default="user") # 'user' or 'admin'
    saved_destinations = Column(JSON, default=list) # list of city ids
    created_at = Column(DateTime, default=datetime.utcnow)
