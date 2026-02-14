from sqlalchemy import Column, Integer, String, DateTime, Text, Date
from sqlalchemy.sql import func
from database import Base

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    certificate_number = Column(String, unique=True, index=True)
    client_id = Column(Integer, nullable=False, index=True)
    policy_id = Column(Integer, nullable=False)
    holder_name = Column(String, nullable=False)
    holder_address = Column(Text)
    status = Column(String, default="active")  # active, expired, revoked
    issued_date = Column(Date)
    expiration_date = Column(Date)
    requested_by = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
