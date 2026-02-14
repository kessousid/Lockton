from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.sql import func
from database import Base

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String, unique=True, index=True, nullable=False)
    policy_id = Column(Integer, nullable=False, index=True)
    client_id = Column(Integer, nullable=False, index=True)
    type = Column(String)  # property_damage, bodily_injury, theft, liability, natural_disaster
    status = Column(String, default="filed")  # filed, under_review, approved, denied, paid, closed
    amount_claimed = Column(Float, default=0)
    amount_approved = Column(Float, default=0)
    amount_paid = Column(Float, default=0)
    date_filed = Column(Date)
    date_of_loss = Column(Date)
    date_resolved = Column(Date, nullable=True)
    description = Column(Text)
    fraud_risk_score = Column(Float, default=0)  # 0-100
    adjuster_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
