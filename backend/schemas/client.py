from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ClientBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[float] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    assigned_broker_id: Optional[int] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[float] = None
    notes: Optional[str] = None
    assigned_broker_id: Optional[int] = None
    status: Optional[str] = None


class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    risk_score: Optional[float] = None
    retention_risk: Optional[str] = None
    status: Optional[str] = None
    assigned_broker_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
