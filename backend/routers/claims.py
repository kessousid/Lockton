from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.claim import Claim
from schemas.claim import ClaimCreate, ClaimUpdate, ClaimResponse
from middleware.auth import get_current_user
from models.user import User
from datetime import date

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.get("", response_model=list[ClaimResponse])
def list_claims(
    client_id: int = Query(None),
    policy_id: int = Query(None),
    status: str = Query(None),
    type: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Claim)
    if client_id:
        q = q.filter(Claim.client_id == client_id)
    if policy_id:
        q = q.filter(Claim.policy_id == policy_id)
    if status:
        q = q.filter(Claim.status == status)
    if type:
        q = q.filter(Claim.type == type)
    return q.order_by(Claim.date_filed.desc()).offset(skip).limit(limit).all()


@router.get("/analytics")
def claims_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(func.count(Claim.id)).scalar() or 0
    approved = db.query(func.count(Claim.id)).filter(Claim.status.in_(["approved", "paid"])).scalar() or 0
    denied = db.query(func.count(Claim.id)).filter(Claim.status == "denied").scalar() or 0
    avg_amount = db.query(func.avg(Claim.amount_claimed)).scalar() or 0
    total_paid = db.query(func.sum(Claim.amount_paid)).scalar() or 0

    resolved = db.query(Claim).filter(Claim.date_resolved.isnot(None), Claim.date_filed.isnot(None)).all()
    cycle_times = [(c.date_resolved - c.date_filed).days for c in resolved if c.date_resolved and c.date_filed]
    avg_cycle = sum(cycle_times) / len(cycle_times) if cycle_times else 0

    return {
        "total_claims": total,
        "approval_rate": round(approved / max(total, 1) * 100, 1),
        "denial_rate": round(denied / max(total, 1) * 100, 1),
        "average_claim_amount": round(avg_amount, 2),
        "total_paid": round(total_paid, 2),
        "average_cycle_time_days": round(avg_cycle, 1),
    }


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.post("", response_model=ClaimResponse)
def create_claim(data: ClaimCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = Claim(**data.model_dump())
    if not claim.date_filed:
        claim.date_filed = date.today()
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.put("/{claim_id}", response_model=ClaimResponse)
def update_claim(claim_id: int, data: ClaimUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(claim, k, v)
    db.commit()
    db.refresh(claim)
    return claim


@router.delete("/{claim_id}")
def delete_claim(claim_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = "closed"
    db.commit()
    return {"message": "Claim closed"}
