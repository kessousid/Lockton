from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.workflow import Workflow, WorkflowTask
from schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowTaskCreate, WorkflowTaskUpdate, WorkflowTaskResponse,
)
from middleware.auth import get_current_user
from services.workflow_service import complete_task
from models.user import User

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("", response_model=list[WorkflowResponse])
def list_workflows(status: str = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Workflow)
    if status:
        q = q.filter(Workflow.status == status)
    return q.all()


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.post("", response_model=WorkflowResponse)
def create_workflow(data: WorkflowCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = Workflow(**data.model_dump(), created_by=current_user.id)
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(workflow_id: int, data: WorkflowUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(wf, k, v)
    db.commit()
    db.refresh(wf)
    return wf


@router.get("/tasks/all", response_model=list[WorkflowTaskResponse])
def list_all_tasks(
    workflow_id: int = Query(None),
    status: str = Query(None),
    assigned_to: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(WorkflowTask)
    if workflow_id:
        q = q.filter(WorkflowTask.workflow_id == workflow_id)
    if status:
        q = q.filter(WorkflowTask.status == status)
    if assigned_to:
        q = q.filter(WorkflowTask.assigned_to == assigned_to)
    return q.all()


@router.post("/tasks", response_model=WorkflowTaskResponse)
def create_task(data: WorkflowTaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = WorkflowTask(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=WorkflowTaskResponse)
def update_task(task_id: int, data: WorkflowTaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/complete", response_model=WorkflowTaskResponse)
def complete_workflow_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = complete_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
