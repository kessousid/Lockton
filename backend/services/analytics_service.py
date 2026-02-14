from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Client, Policy, Claim, Renewal, Commission, Carrier
from datetime import date, timedelta


def get_dashboard_kpis(db: Session) -> dict:
    total_clients = db.query(func.count(Client.id)).scalar() or 0
    active_policies = db.query(func.count(Policy.id)).filter(Policy.status == "active").scalar() or 0
    pending_claims = db.query(func.count(Claim.id)).filter(Claim.status.in_(["filed", "under_review"])).scalar() or 0
    total_premium = db.query(func.sum(Policy.premium)).filter(Policy.status == "active").scalar() or 0
    total_clients_active = db.query(func.count(Client.id)).filter(Client.status == "active").scalar() or 1
    high_risk = db.query(func.count(Client.id)).filter(Client.retention_risk == "high").scalar() or 0
    retention_rate = round((1 - high_risk / max(total_clients_active, 1)) * 100, 1)

    return {
        "total_clients": total_clients,
        "active_policies": active_policies,
        "pending_claims": pending_claims,
        "total_premium_revenue": round(total_premium, 2),
        "retention_rate": retention_rate,
    }


def get_policy_distribution(db: Session) -> list:
    results = db.query(Policy.type, func.count(Policy.id)).filter(Policy.status == "active").group_by(Policy.type).all()
    return [{"type": r[0], "count": r[1]} for r in results]


def get_monthly_premiums(db: Session) -> list:
    policies = db.query(Policy).filter(Policy.status == "active").all()
    monthly = {}
    for p in policies:
        if p.effective_date:
            key = p.effective_date.strftime("%Y-%m")
            monthly[key] = monthly.get(key, 0) + (p.premium or 0)
    return [{"month": k, "premium": round(v, 2)} for k, v in sorted(monthly.items())]


def get_claims_by_status(db: Session) -> list:
    results = db.query(Claim.status, func.count(Claim.id)).group_by(Claim.status).all()
    return [{"status": r[0], "count": r[1]} for r in results]


def get_renewal_pipeline(db: Session) -> list:
    results = db.query(Renewal.status, func.count(Renewal.id)).group_by(Renewal.status).all()
    return [{"status": r[0], "count": r[1]} for r in results]


def get_alerts(db: Session) -> list:
    alerts = []
    today = date.today()
    upcoming_renewals = db.query(Renewal).filter(
        Renewal.due_date <= today + timedelta(days=30),
        Renewal.status.in_(["upcoming", "in_progress"]),
    ).count()
    if upcoming_renewals:
        alerts.append({"type": "warning", "message": f"{upcoming_renewals} renewals due within 30 days"})

    pending = db.query(Claim).filter(Claim.status.in_(["filed", "under_review"])).count()
    if pending:
        alerts.append({"type": "info", "message": f"{pending} claims pending review"})

    at_risk = db.query(Client).filter(Client.retention_risk == "high").count()
    if at_risk:
        alerts.append({"type": "danger", "message": f"{at_risk} clients at high retention risk"})

    return alerts


def get_loss_ratio_by_industry(db: Session) -> list:
    clients = db.query(Client).all()
    industry_data = {}
    for c in clients:
        ind = c.industry or "Other"
        if ind not in industry_data:
            industry_data[ind] = {"premiums": 0, "claims_paid": 0}
        policies = db.query(Policy).filter(Policy.client_id == c.id, Policy.status == "active").all()
        for p in policies:
            industry_data[ind]["premiums"] += p.premium or 0
        claims = db.query(Claim).filter(Claim.client_id == c.id).all()
        for cl in claims:
            industry_data[ind]["claims_paid"] += cl.amount_paid or 0

    return [
        {
            "industry": k,
            "premiums": round(v["premiums"], 2),
            "claims_paid": round(v["claims_paid"], 2),
            "loss_ratio": round(v["claims_paid"] / max(v["premiums"], 1) * 100, 1),
        }
        for k, v in industry_data.items()
    ]


def get_broker_productivity(db: Session) -> list:
    from models.user import User
    brokers = db.query(User).filter(User.role == "broker").all()
    result = []
    for b in brokers:
        client_count = db.query(func.count(Client.id)).filter(Client.assigned_broker_id == b.id).scalar() or 0
        policies = db.query(Policy).join(Client, Policy.client_id == Client.id).filter(Client.assigned_broker_id == b.id).all()
        total_premium = sum(p.premium or 0 for p in policies)
        result.append({
            "broker_id": b.id,
            "broker_name": b.full_name,
            "clients": client_count,
            "policies": len(policies),
            "total_premium": round(total_premium, 2),
        })
    return result


def get_revenue_forecast(db: Session) -> list:
    today = date.today()
    forecast = []
    for i in range(12):
        month = today.replace(day=1) + timedelta(days=32 * i)
        month = month.replace(day=1)
        active = db.query(func.sum(Policy.premium)).filter(
            Policy.status == "active",
            Policy.expiration_date >= month,
        ).scalar() or 0
        forecast.append({
            "month": month.strftime("%Y-%m"),
            "projected_revenue": round(active / 12, 2),
        })
    return forecast
