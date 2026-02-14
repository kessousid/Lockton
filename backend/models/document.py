from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_path = Column(String)
    file_type = Column(String)  # pdf, docx, xlsx, image
    file_size = Column(Integer, default=0)
    category = Column(String)  # policy, claim, certificate, endorsement, invoice, other
    client_id = Column(Integer, nullable=True, index=True)
    policy_id = Column(Integer, nullable=True)
    claim_id = Column(Integer, nullable=True)
    uploaded_by = Column(Integer, nullable=True)
    description = Column(Text)
    ocr_text = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
