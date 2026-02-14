from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WorkflowBase(BaseModel):
    name: str
    type: Optional[str] = None
    trigger: Optional[str] = None
    description: Optional[str] = None
    steps_json: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    trigger: Optional[str] = None
    description: Optional[str] = None
    steps_json: Optional[str] = None
    status: Optional[str] = None


class WorkflowResponse(WorkflowBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None


class WorkflowTaskBase(BaseModel):
    workflow_id: int
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None


class WorkflowTaskCreate(WorkflowTaskBase):
    pass


class WorkflowTaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    completed_at: Optional[datetime] = None


class WorkflowTaskResponse(WorkflowTaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
