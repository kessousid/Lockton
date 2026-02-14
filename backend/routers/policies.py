from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.policy import Policy
from schemas.policy import PolicyCreate, PolicyUpdate, PolicyResponse
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/policies", tags=["policies"])


@router.get("", response_model=list[PolicyResponse])
def list_policies(
    client_id: int = Query(None),
    carrier_id: int = Query(None),
    type: str = Query(None),
    status: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Policy)
    if client_id:
        q = q.filter(Policy.client_id == client_id)
    if carrier_id:
        q = q.filter(Policy.carrier_id == carrier_id)
    if type:
        q = q.filter(Policy.type == type)
    if status:
        q = q.filter(Policy.status == status)
    return q.offset(skip).limit(limit).all()


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.post("", response_model=PolicyResponse)
def create_policy(data: PolicyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = Policy(**data.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.put("/{policy_id}", response_model=PolicyResponse)
def update_policy(policy_id: int, data: PolicyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(policy, k, v)
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.status = "cancelled"
    db.commit()
    return {"message": "Policy cancelled"}


@router.get("/compare/{id1}/{id2}")
def compare_policies(id1: int, id2: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p1 = db.query(Policy).filter(Policy.id == id1).first()
    p2 = db.query(Policy).filter(Policy.id == id2).first()
    if not p1 or not p2:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {
        "policies": [PolicyResponse.model_validate(p1), PolicyResponse.model_validate(p2)],
        "comparison": {
            "premium_diff": (p2.premium or 0) - (p1.premium or 0),
            "deductible_diff": (p2.deductible or 0) - (p1.deductible or 0),
            "coverage_diff": (p2.coverage_limit or 0) - (p1.coverage_limit or 0),
        },
    }
