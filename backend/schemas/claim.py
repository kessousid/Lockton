from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ClaimBase(BaseModel):
    claim_number: str
    policy_id: int
    client_id: int
    type: Optional[str] = None
    amount_claimed: Optional[float] = None
    date_filed: Optional[date] = None
    date_of_loss: Optional[date] = None
    description: Optional[str] = None


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    claim_number: Optional[str] = None
    policy_id: Optional[int] = None
    client_id: Optional[int] = None
    type: Optional[str] = None
    amount_claimed: Optional[float] = None
    date_filed: Optional[date] = None
    date_of_loss: Optional[date] = None
    description: Optional[str] = None
    status: Optional[str] = None
    amount_approved: Optional[float] = None
    amount_paid: Optional[float] = None
    date_resolved: Optional[date] = None
    adjuster_notes: Optional[str] = None


class ClaimResponse(ClaimBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    amount_approved: Optional[float] = None
    amount_paid: Optional[float] = None
    fraud_risk_score: Optional[float] = None
    date_resolved: Optional[date] = None
    adjuster_notes: Optional[str] = None
    created_at: Optional[datetime] = None
