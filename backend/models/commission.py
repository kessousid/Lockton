from sqlalchemy import Column, Integer, String, Float, DateTime, Date
from sqlalchemy.sql import func
from database import Base

class Commission(Base):
    __tablename__ = "commissions"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, nullable=False, index=True)
    carrier_id = Column(Integer, nullable=False, index=True)
    client_id = Column(Integer, nullable=False)
    broker_id = Column(Integer, nullable=True)
    amount = Column(Float, default=0)
    rate = Column(Float, default=0)  # percentage
    status = Column(String, default="pending")  # pending, paid, cancelled
    period_start = Column(Date)
    period_end = Column(Date)
    paid_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
