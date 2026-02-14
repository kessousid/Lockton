from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.renewal import Renewal
from schemas.renewal import RenewalCreate, RenewalUpdate, RenewalResponse
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/renewals", tags=["renewals"])


@router.get("", response_model=list[RenewalResponse])
def list_renewals(
    client_id: int = Query(None),
    status: str = Query(None),
    priority: str = Query(None),
    assigned_to: int = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Renewal)
    if client_id:
        q = q.filter(Renewal.client_id == client_id)
    if status:
        q = q.filter(Renewal.status == status)
    if priority:
        q = q.filter(Renewal.priority == priority)
    if assigned_to:
        q = q.filter(Renewal.assigned_to == assigned_to)
    return q.order_by(Renewal.due_date.asc()).offset(skip).limit(limit).all()


@router.get("/{renewal_id}", response_model=RenewalResponse)
def get_renewal(renewal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    renewal = db.query(Renewal).filter(Renewal.id == renewal_id).first()
    if not renewal:
        raise HTTPException(status_code=404, detail="Renewal not found")
    return renewal


@router.post("", response_model=RenewalResponse)
def create_renewal(data: RenewalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    renewal = Renewal(**data.model_dump())
    db.add(renewal)
    db.commit()
    db.refresh(renewal)
    return renewal


@router.put("/{renewal_id}", response_model=RenewalResponse)
def update_renewal(renewal_id: int, data: RenewalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    renewal = db.query(Renewal).filter(Renewal.id == renewal_id).first()
    if not renewal:
        raise HTTPException(status_code=404, detail="Renewal not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(renewal, k, v)
    db.commit()
    db.refresh(renewal)
    return renewal
