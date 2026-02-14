from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    industry = Column(String)
    company_size = Column(String)  # small, medium, large, enterprise
    annual_revenue = Column(Float, default=0)
    risk_score = Column(Float, default=50.0)  # 0-100 AI-predicted
    retention_risk = Column(String, default="low")  # low, medium, high
    status = Column(String, default="active")  # active, inactive, prospect
    assigned_broker_id = Column(Integer, nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
