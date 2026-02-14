from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.client import Client
from models.policy import Policy
from services.ai_service import chat_with_assistant, analyze_document, predict_risk

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    client_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str


class AnalyzeRequest(BaseModel):
    text: str


class RiskRequest(BaseModel):
    client_id: int


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    context = ""
    if req.client_id:
        client = db.query(Client).filter(Client.id == req.client_id).first()
        if client:
            policies = db.query(Policy).filter(Policy.client_id == client.id).all()
            context = f"Client: {client.name}, Industry: {client.industry}, Risk Score: {client.risk_score}. "
            context += f"Policies: {', '.join(f'{p.type} (${p.premium:,.0f})' for p in policies)}."
    response = chat_with_assistant(req.message, context)
    return ChatResponse(response=response)


@router.post("/analyze-document")
def analyze_doc(req: AnalyzeRequest, current_user: User = Depends(get_current_user)):
    return analyze_document(req.text)


@router.post("/predict-risk")
def risk_prediction(req: RiskRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == req.client_id).first()
    if not client:
        return {"error": "Client not found"}
    policies = db.query(Policy).filter(Policy.client_id == client.id).all()
    client_data = {
        "name": client.name,
        "industry": client.industry,
        "annual_revenue": client.annual_revenue,
        "company_size": client.company_size,
        "policy_count": len(policies),
        "total_premium": sum(p.premium or 0 for p in policies),
        "policy_types": [p.type for p in policies],
    }
    return predict_risk(client_data)
