from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.client import Client
from models.policy import Policy
from models.claim import Claim
from schemas.client import ClientCreate, ClientUpdate, ClientResponse
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
def list_clients(
    search: str = Query(None),
    status: str = Query(None),
    industry: str = Query(None),
    retention_risk: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Client)
    if search:
        q = q.filter(Client.name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Client.status == status)
    if industry:
        q = q.filter(Client.industry == industry)
    if retention_risk:
        q = q.filter(Client.retention_risk == retention_risk)
    if current_user.role == "client":
        q = q.filter(Client.email == current_user.email)
    return q.offset(skip).limit(limit).all()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/{client_id}/summary")
def get_client_summary(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    policies = db.query(Policy).filter(Policy.client_id == client_id).all()
    claims = db.query(Claim).filter(Claim.client_id == client_id).all()
    total_premium = sum(p.premium or 0 for p in policies if p.status == "active")
    total_claims = sum(c.amount_paid or 0 for c in claims)
    return {
        "client": ClientResponse.model_validate(client),
        "total_policies": len(policies),
        "active_policies": len([p for p in policies if p.status == "active"]),
        "total_premium": round(total_premium, 2),
        "total_claims": len(claims),
        "total_claims_paid": round(total_claims, 2),
        "loss_ratio": round(total_claims / max(total_premium, 1) * 100, 1),
        "cross_sell_opportunities": _get_cross_sell(policies),
    }


def _get_cross_sell(policies: list) -> list:
    existing_types = {p.type for p in policies if p.status == "active"}
    all_types = {"general_liability", "property", "workers_comp", "auto", "umbrella", "cyber", "professional_liability", "health"}
    missing = all_types - existing_types
    suggestions = []
    if "cyber" in missing:
        suggestions.append({"type": "cyber", "reason": "Growing cyber threats — protect against data breaches"})
    if "umbrella" in missing:
        suggestions.append({"type": "umbrella", "reason": "Additional liability protection beyond primary coverage"})
    if "professional_liability" in missing:
        suggestions.append({"type": "professional_liability", "reason": "Protect against professional negligence claims"})
    if "workers_comp" in missing:
        suggestions.append({"type": "workers_comp", "reason": "Required coverage for employee workplace injuries"})
    return suggestions[:3]


@router.post("", response_model=ClientResponse)
def create_client(data: ClientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(client, k, v)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.status = "inactive"
    db.commit()
    return {"message": "Client deactivated"}
