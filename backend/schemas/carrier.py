from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CarrierBase(BaseModel):
    name: str
    code: Optional[str] = None
    am_best_rating: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    notes: Optional[str] = None


class CarrierCreate(CarrierBase):
    pass


class CarrierUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    am_best_rating: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    notes: Optional[str] = None
    api_integrated: Optional[bool] = None
    integration_status: Optional[str] = None
    status: Optional[str] = None


class CarrierResponse(CarrierBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    api_integrated: Optional[bool] = None
    integration_status: Optional[str] = None
    claims_ratio: Optional[float] = None
    avg_response_time_days: Optional[float] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
