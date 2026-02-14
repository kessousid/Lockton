from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from middleware.auth import get_current_user
from models.user import User
from services.analytics_service import (
    get_dashboard_kpis,
    get_policy_distribution,
    get_monthly_premiums,
    get_claims_by_status,
    get_renewal_pipeline,
    get_alerts,
    get_loss_ratio_by_industry,
    get_broker_productivity,
    get_revenue_forecast,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "kpis": get_dashboard_kpis(db),
        "policy_distribution": get_policy_distribution(db),
        "monthly_premiums": get_monthly_premiums(db),
        "claims_by_status": get_claims_by_status(db),
        "renewal_pipeline": get_renewal_pipeline(db),
        "alerts": get_alerts(db),
    }


@router.get("/loss-ratio")
def loss_ratio(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_loss_ratio_by_industry(db)


@router.get("/broker-productivity")
def broker_productivity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_broker_productivity(db)


@router.get("/revenue-forecast")
def revenue_forecast(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_revenue_forecast(db)


@router.get("/kpis")
def kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_dashboard_kpis(db)


@router.get("/alerts")
def alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_alerts(db)
