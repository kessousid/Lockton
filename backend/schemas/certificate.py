from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CertificateBase(BaseModel):
    client_id: int
    policy_id: int
    holder_name: str
    holder_address: Optional[str] = None
    issued_date: Optional[date] = None
    expiration_date: Optional[date] = None
    requested_by: Optional[str] = None
    notes: Optional[str] = None


class CertificateCreate(CertificateBase):
    pass


class CertificateResponse(CertificateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    certificate_number: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
