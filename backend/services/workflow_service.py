from sqlalchemy.orm import Session
from models.workflow import Workflow, WorkflowTask
from datetime import datetime, timezone


def get_workflows(db: Session, status: str = None):
    q = db.query(Workflow)
    if status:
        q = q.filter(Workflow.status == status)
    return q.all()


def get_workflow_tasks(db: Session, workflow_id: int = None, status: str = None, assigned_to: int = None):
    q = db.query(WorkflowTask)
    if workflow_id:
        q = q.filter(WorkflowTask.workflow_id == workflow_id)
    if status:
        q = q.filter(WorkflowTask.status == status)
    if assigned_to:
        q = q.filter(WorkflowTask.assigned_to == assigned_to)
    return q.all()


def complete_task(db: Session, task_id: int):
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if task:
        task.status = "completed"
        task.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
    return task
