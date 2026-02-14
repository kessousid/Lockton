from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PolicyBase(BaseModel):
    policy_number: str
    client_id: int
    carrier_id: Optional[int] = None
    type: str
    premium: Optional[float] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    description: Optional[str] = None


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(BaseModel):
    policy_number: Optional[str] = None
    client_id: Optional[int] = None
    carrier_id: Optional[int] = None
    type: Optional[str] = None
    premium: Optional[float] = None
    deductible: Optional[float] = None
    coverage_limit: Optional[float] = None
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    description: Optional[str] = None
    status: Optional[str] = None


class PolicyResponse(PolicyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    created_at: Optional[datetime] = None
