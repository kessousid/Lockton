from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    category: Optional[str] = None
    client_id: Optional[int] = None
    policy_id: Optional[int] = None
    claim_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    description: Optional[str] = None
    version: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
