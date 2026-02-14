from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.sql import func
from database import Base

class Renewal(Base):
    __tablename__ = "renewals"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, nullable=False, index=True)
    client_id = Column(Integer, nullable=False, index=True)
    status = Column(String, default="upcoming")  # upcoming, in_progress, quoted, approved, completed, lost
    due_date = Column(Date, nullable=False)
    premium_current = Column(Float, default=0)
    premium_proposed = Column(Float, default=0)
    premium_change_pct = Column(Float, default=0)
    assigned_to = Column(Integer, nullable=True)
    priority = Column(String, default="medium")  # low, medium, high, critical
    notes = Column(Text)
    last_contacted = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
