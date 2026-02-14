from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.document import Document
from schemas.document import DocumentResponse
from middleware.auth import get_current_user
from models.user import User
import os

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    client_id: int = Query(None),
    policy_id: int = Query(None),
    claim_id: int = Query(None),
    category: str = Query(None),
    search: str = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Document).filter(Document.status == "active")
    if client_id:
        q = q.filter(Document.client_id == client_id)
    if policy_id:
        q = q.filter(Document.policy_id == policy_id)
    if claim_id:
        q = q.filter(Document.claim_id == claim_id)
    if category:
        q = q.filter(Document.category == category)
    if search:
        q = q.filter(Document.name.ilike(f"%{search}%"))
    return q.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(None),
    category: str = Form("other"),
    client_id: int = Form(None),
    policy_id: int = Form(None),
    claim_id: int = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_name = name or file.filename
    file_ext = os.path.splitext(file.filename)[1].lower()
    file_type = "pdf" if file_ext == ".pdf" else "image" if file_ext in [".jpg", ".jpeg", ".png", ".gif"] else "docx" if file_ext in [".doc", ".docx"] else "xlsx" if file_ext in [".xls", ".xlsx"] else "other"

    content = await file.read()
    file_path = os.path.join(UPLOAD_DIR, f"{doc.id if 'doc' in dir() else 'temp'}_{file.filename}")

    doc = Document(
        name=file_name,
        file_path=file_path,
        file_type=file_type,
        file_size=len(content),
        category=category,
        client_id=client_id,
        policy_id=policy_id,
        claim_id=claim_id,
        uploaded_by=current_user.id,
        description=description,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    actual_path = os.path.join(UPLOAD_DIR, f"{doc.id}_{file.filename}")
    with open(actual_path, "wb") as f:
        f.write(content)
    doc.file_path = actual_path
    db.commit()

    return doc


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = "deleted"
    db.commit()
    return {"message": "Document deleted"}
