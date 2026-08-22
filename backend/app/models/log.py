import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(String(512), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
