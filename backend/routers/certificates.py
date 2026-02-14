from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.certificate import Certificate
from models.policy import Policy
from models.client import Client
from schemas.certificate import CertificateCreate, CertificateResponse
from middleware.auth import get_current_user
from models.user import User
from datetime import date
import random
import string

router = APIRouter(prefix="/api/certificates", tags=["certificates"])


def generate_cert_number():
    return "COI-" + "".join(random.choices(string.digits, k=8))


@router.get("", response_model=list[CertificateResponse])
def list_certificates(
    client_id: int = Query(None),
    status: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Certificate)
    if client_id:
        q = q.filter(Certificate.client_id == client_id)
    if status:
        q = q.filter(Certificate.status == status)
    return q.order_by(Certificate.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{cert_id}", response_model=CertificateResponse)
def get_certificate(cert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert


@router.post("", response_model=CertificateResponse)
def create_certificate(data: CertificateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = Certificate(**data.model_dump(), certificate_number=generate_cert_number())
    if not cert.issued_date:
        cert.issued_date = date.today()
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.post("/bulk")
def bulk_create_certificates(items: list[CertificateCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    created = []
    for data in items:
        cert = Certificate(**data.model_dump(), certificate_number=generate_cert_number())
        if not cert.issued_date:
            cert.issued_date = date.today()
        db.add(cert)
        created.append(cert)
    db.commit()
    for c in created:
        db.refresh(c)
    return [CertificateResponse.model_validate(c) for c in created]


@router.get("/{cert_id}/pdf")
def download_certificate_pdf(cert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    client = db.query(Client).filter(Client.id == cert.client_id).first()
    policy = db.query(Policy).filter(Policy.id == cert.policy_id).first()
    return {
        "certificate_number": cert.certificate_number,
        "holder_name": cert.holder_name,
        "holder_address": cert.holder_address,
        "client_name": client.name if client else "N/A",
        "policy_number": policy.policy_number if policy else "N/A",
        "policy_type": policy.type if policy else "N/A",
        "coverage_limit": policy.coverage_limit if policy else 0,
        "effective_date": str(policy.effective_date) if policy else "",
        "expiration_date": str(policy.expiration_date) if policy else "",
        "issued_date": str(cert.issued_date),
        "status": cert.status,
    }
