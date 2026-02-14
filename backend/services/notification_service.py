from sqlalchemy.orm import Session
from models import Renewal, Claim, Client
from datetime import date, timedelta


def get_notifications(db: Session, user_id: int = None) -> list:
    notifications = []
    today = date.today()

    # Renewal alerts
    renewals_30 = db.query(Renewal).filter(
        Renewal.due_date <= today + timedelta(days=30),
        Renewal.due_date >= today,
        Renewal.status.in_(["upcoming", "in_progress"]),
    ).all()
    for r in renewals_30:
        days_left = (r.due_date - today).days
        notifications.append({
            "id": f"renewal-{r.id}",
            "type": "renewal",
            "priority": "critical" if days_left <= 7 else "high" if days_left <= 14 else "medium",
            "title": f"Renewal due in {days_left} days",
            "message": f"Policy renewal for client #{r.client_id} is due on {r.due_date}",
            "entity_id": r.id,
            "date": str(today),
        })

    # Pending claims
    pending_claims = db.query(Claim).filter(Claim.status == "filed").all()
    for c in pending_claims:
        notifications.append({
            "id": f"claim-{c.id}",
            "type": "claim",
            "priority": "high",
            "title": f"New claim requires review",
            "message": f"Claim {c.claim_number} filed for ${c.amount_claimed:,.2f}",
            "entity_id": c.id,
            "date": str(c.date_filed or today),
        })

    # At-risk clients
    at_risk = db.query(Client).filter(Client.retention_risk == "high").all()
    for client in at_risk:
        notifications.append({
            "id": f"risk-{client.id}",
            "type": "risk",
            "priority": "medium",
            "title": f"Client at risk: {client.name}",
            "message": f"Risk score: {client.risk_score}. Consider scheduling a review.",
            "entity_id": client.id,
            "date": str(today),
        })

    return sorted(notifications, key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x["priority"], 4))
