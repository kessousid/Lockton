from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.carrier import Carrier
from models.policy import Policy
from models.commission import Commission
from schemas.carrier import CarrierCreate, CarrierUpdate, CarrierResponse
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/carriers", tags=["carriers"])


@router.get("", response_model=list[CarrierResponse])
def list_carriers(
    search: str = Query(None),
    status: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Carrier)
    if search:
        q = q.filter(Carrier.name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Carrier.status == status)
    return q.offset(skip).limit(limit).all()


@router.get("/{carrier_id}", response_model=CarrierResponse)
def get_carrier(carrier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    carrier = db.query(Carrier).filter(Carrier.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Carrier not found")
    return carrier


@router.get("/{carrier_id}/metrics")
def get_carrier_metrics(carrier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    carrier = db.query(Carrier).filter(Carrier.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Carrier not found")
    policy_count = db.query(func.count(Policy.id)).filter(Policy.carrier_id == carrier_id).scalar() or 0
    total_premium = db.query(func.sum(Policy.premium)).filter(Policy.carrier_id == carrier_id, Policy.status == "active").scalar() or 0
    total_commission = db.query(func.sum(Commission.amount)).filter(Commission.carrier_id == carrier_id).scalar() or 0
    return {
        "carrier": CarrierResponse.model_validate(carrier),
        "total_policies": policy_count,
        "total_premium": round(total_premium, 2),
        "total_commission": round(total_commission, 2),
        "claims_ratio": carrier.claims_ratio,
        "avg_response_time_days": carrier.avg_response_time_days,
    }


@router.post("", response_model=CarrierResponse)
def create_carrier(data: CarrierCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    carrier = Carrier(**data.model_dump())
    db.add(carrier)
    db.commit()
    db.refresh(carrier)
    return carrier


@router.put("/{carrier_id}", response_model=CarrierResponse)
def update_carrier(carrier_id: int, data: CarrierUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    carrier = db.query(Carrier).filter(Carrier.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Carrier not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(carrier, k, v)
    db.commit()
    db.refresh(carrier)
    return carrier
