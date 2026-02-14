from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class RenewalBase(BaseModel):
    policy_id: int
    client_id: int
    due_date: date
    premium_current: Optional[float] = None
    premium_proposed: Optional[float] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class RenewalCreate(RenewalBase):
    assigned_to: Optional[int] = None


class RenewalUpdate(BaseModel):
    policy_id: Optional[int] = None
    client_id: Optional[int] = None
    due_date: Optional[date] = None
    premium_current: Optional[float] = None
    premium_proposed: Optional[float] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    premium_change_pct: Optional[float] = None
    last_contacted: Optional[datetime] = None
    assigned_to: Optional[int] = None


class RenewalResponse(RenewalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    premium_change_pct: Optional[float] = None
    assigned_to: Optional[int] = None
    last_contacted: Optional[datetime] = None
    created_at: Optional[datetime] = None
