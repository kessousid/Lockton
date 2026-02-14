from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.sql import func
from database import Base

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String, unique=True, index=True, nullable=False)
    client_id = Column(Integer, nullable=False, index=True)
    carrier_id = Column(Integer, nullable=True)
    type = Column(String, nullable=False)  # general_liability, property, workers_comp, auto, umbrella, cyber, professional_liability, health
    status = Column(String, default="active")  # active, expired, cancelled, pending
    premium = Column(Float, default=0)
    deductible = Column(Float, default=0)
    coverage_limit = Column(Float, default=0)
    effective_date = Column(Date)
    expiration_date = Column(Date)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
