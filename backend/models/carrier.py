from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from database import Base

class Carrier(Base):
    __tablename__ = "carriers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    code = Column(String, unique=True)
    am_best_rating = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    website = Column(String)
    api_integrated = Column(Boolean, default=False)
    integration_status = Column(String, default="none")  # none, pending, active, error
    claims_ratio = Column(Float, default=0)
    avg_response_time_days = Column(Float, default=0)
    specialties = Column(Text)  # comma-separated
    status = Column(String, default="active")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
