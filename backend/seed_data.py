from sqlalchemy.orm import Session
from middleware.auth import get_password_hash
from models import User, Client, Policy, Claim, Carrier, Renewal, Certificate, Commission, Workflow, WorkflowTask, Document
from datetime import date, timedelta, datetime
import random
import json


def seed_database(db: Session):
    # ── Users ── (always seed if missing, independent of other tables)
    if db.query(User).count() == 0:
        users = [
            User(email="admin@demo.com", hashed_password=get_password_hash("Platform@Admin2024"), full_name="Sarah Mitchell", role="admin", phone="(555) 100-0001", department="Administration"),
            User(email="broker@demo.com", hashed_password=get_password_hash("Platform@Broker2024"), full_name="James Rodriguez", role="broker", phone="(555) 200-0002", department="Commercial Lines"),
            User(email="broker2@demo.com", hashed_password=get_password_hash("Platform@Broker2024"), full_name="Emily Chen", role="broker", phone="(555) 200-0003", department="Personal Lines"),
            User(email="broker3@demo.com", hashed_password=get_password_hash("Platform@Broker2024"), full_name="Michael Thompson", role="broker", phone="(555) 200-0004", department="Specialty"),
            User(email="client@demo.com", hashed_password=get_password_hash("Platform@Client2024"), full_name="Robert Johnson", role="client", phone="(555) 300-0005", department=""),
            User(email="analyst@demo.com", hashed_password=get_password_hash("Platform@Analyst2024"), full_name="Lisa Park", role="analyst", phone="(555) 400-0006", department="Analytics"),
        ]
        db.add_all(users)
        db.flush()

    if db.query(Carrier).count() > 0:
        return

    # ── Carriers ──
    carriers = [
        Carrier(name="Hartford Financial", code="HART", am_best_rating="A+", contact_email="commercial@hartford.com", contact_phone="(860) 547-5000", website="https://www.thehartford.com", api_integrated=True, integration_status="active", claims_ratio=62.5, avg_response_time_days=3.2, specialties="Workers Comp, Auto, Property", status="active"),
        Carrier(name="Travelers Insurance", code="TRAV", am_best_rating="A++", contact_email="agents@travelers.com", contact_phone="(651) 310-7911", website="https://www.travelers.com", api_integrated=True, integration_status="active", claims_ratio=58.3, avg_response_time_days=2.8, specialties="Property, General Liability, Umbrella", status="active"),
        Carrier(name="Chubb Limited", code="CHUB", am_best_rating="A++", contact_email="info@chubb.com", contact_phone="(908) 903-2000", website="https://www.chubb.com", api_integrated=False, integration_status="pending", claims_ratio=55.1, avg_response_time_days=4.1, specialties="Cyber, Professional Liability, D&O", status="active"),
        Carrier(name="Liberty Mutual", code="LBMT", am_best_rating="A", contact_email="commercial@libertymutual.com", contact_phone="(617) 357-9500", website="https://www.libertymutual.com", api_integrated=True, integration_status="active", claims_ratio=65.2, avg_response_time_days=3.5, specialties="Auto, Workers Comp, General Liability", status="active"),
        Carrier(name="Zurich Insurance", code="ZURI", am_best_rating="A+", contact_email="zurich.us@zurich.com", contact_phone="(800) 382-2150", website="https://www.zurichna.com", api_integrated=False, integration_status="none", claims_ratio=60.8, avg_response_time_days=5.0, specialties="Construction, Energy, Healthcare", status="active"),
        Carrier(name="AIG", code="AIG1", am_best_rating="A", contact_email="us.brokers@aig.com", contact_phone="(212) 770-7000", website="https://www.aig.com", api_integrated=True, integration_status="active", claims_ratio=68.4, avg_response_time_days=4.5, specialties="Cyber, E&O, International", status="active"),
    ]
    db.add_all(carriers)
    db.flush()

    # ── Clients ──
    clients_data = [
        ("Apex Manufacturing Co.", "John Miller", "jmiller@apex.com", "(555) 101-1001", "456 Industrial Blvd", "Chicago", "IL", "60601", "Manufacturing", "large", 45000000, 35, "low", 2),
        ("TechVision Solutions", "Sarah Williams", "swilliams@techvision.com", "(555) 102-1002", "789 Innovation Dr", "San Francisco", "CA", "94105", "Technology", "medium", 12000000, 25, "low", 2),
        ("Greenfield Construction", "Mike Davis", "mdavis@greenfield.com", "(555) 103-1003", "321 Builder Ave", "Denver", "CO", "80202", "Construction", "large", 78000000, 72, "high", 3),
        ("Pacific Healthcare Group", "Dr. Lisa Chen", "lchen@pacifichg.com", "(555) 104-1004", "100 Medical Center Pkwy", "Seattle", "WA", "98101", "Healthcare", "enterprise", 120000000, 45, "medium", 3),
        ("Riverside Restaurants LLC", "Tony Martinez", "tmartinez@riverside.com", "(555) 105-1005", "55 Culinary Lane", "Miami", "FL", "33101", "Hospitality", "medium", 8500000, 58, "medium", 2),
        ("Atlas Logistics Inc.", "Karen White", "kwhite@atlas.com", "(555) 106-1006", "900 Freight Way", "Memphis", "TN", "38103", "Transportation", "large", 65000000, 40, "low", 4),
        ("Summit Financial Advisors", "David Park", "dpark@summit.com", "(555) 107-1007", "200 Wall Street Ste 400", "New York", "NY", "10005", "Finance", "small", 3200000, 30, "low", 4),
        ("EcoEnergy Solutions", "Rachel Green", "rgreen@ecoeng.com", "(555) 108-1008", "750 Solar Blvd", "Austin", "TX", "73301", "Energy", "medium", 22000000, 55, "medium", 3),
        ("Midwest Agriculture Corp", "Bob Johnson", "bjohnson@midwestag.com", "(555) 109-1009", "400 Farm Road", "Des Moines", "IA", "50309", "Agriculture", "large", 38000000, 42, "low", 2),
        ("Digital Media Partners", "Amy Foster", "afoster@dmp.com", "(555) 110-1010", "600 Creative Blvd", "Los Angeles", "CA", "90001", "Media", "small", 5500000, 35, "low", 4),
        ("National Retail Group", "Steve Harris", "sharris@nrg.com", "(555) 111-1011", "1200 Commerce Dr", "Dallas", "TX", "75201", "Retail", "enterprise", 250000000, 48, "medium", 2),
        ("Precision Engineering Ltd", "Tom Wilson", "twilson@precision.com", "(555) 112-1012", "88 Gear Street", "Detroit", "MI", "48201", "Manufacturing", "medium", 15000000, 38, "low", 3),
    ]
    clients = []
    for name, contact, email, phone, addr, city, state, zip_c, ind, size, rev, risk, ret_risk, broker_id in clients_data:
        c = Client(name=name, contact_name=contact, email=email, phone=phone, address=addr, city=city, state=state, zip_code=zip_c, industry=ind, company_size=size, annual_revenue=rev, risk_score=risk, retention_risk=ret_risk, status="active", assigned_broker_id=broker_id)
        clients.append(c)
    db.add_all(clients)
    db.flush()

    # ── Policies ──
    today = date.today()
    policy_types = ["general_liability", "property", "workers_comp", "auto", "umbrella", "cyber", "professional_liability", "health"]
    policies = []
    policy_num = 1000
    for client in clients:
        num_policies = random.randint(2, 5)
        chosen = random.sample(policy_types, min(num_policies, len(policy_types)))
        for ptype in chosen:
            carrier = random.choice(carriers)
            premium = random.randint(5000, 150000)
            deductible = random.choice([1000, 2500, 5000, 10000, 25000])
            coverage = random.choice([500000, 1000000, 2000000, 5000000, 10000000])
            eff = today - timedelta(days=random.randint(30, 300))
            exp = eff + timedelta(days=365)
            status = "active" if exp > today else "expired"
            policy_num += 1
            p = Policy(
                policy_number=f"POL-{policy_num:06d}",
                client_id=client.id, carrier_id=carrier.id,
                type=ptype, status=status, premium=premium,
                deductible=deductible, coverage_limit=coverage,
                effective_date=eff, expiration_date=exp,
                description=f"{ptype.replace('_', ' ').title()} coverage for {client.name}",
            )
            policies.append(p)
    db.add_all(policies)
    db.flush()

    # ── Claims ──
    claim_types = ["property_damage", "bodily_injury", "theft", "liability", "natural_disaster"]
    claim_statuses = ["filed", "under_review", "approved", "denied", "paid", "closed"]
    claims = []
    claim_num = 5000
    for p in random.sample(policies, min(25, len(policies))):
        claim_num += 1
        status = random.choice(claim_statuses)
        amount = random.randint(2000, 200000)
        approved = amount * random.uniform(0.5, 1.0) if status in ["approved", "paid", "closed"] else 0
        paid = approved if status in ["paid", "closed"] else 0
        filed = today - timedelta(days=random.randint(5, 180))
        resolved = filed + timedelta(days=random.randint(10, 60)) if status in ["approved", "denied", "paid", "closed"] else None
        cl = Claim(
            claim_number=f"CLM-{claim_num:06d}",
            policy_id=p.id, client_id=p.client_id,
            type=random.choice(claim_types), status=status,
            amount_claimed=amount, amount_approved=round(approved, 2), amount_paid=round(paid, 2),
            date_filed=filed, date_of_loss=filed - timedelta(days=random.randint(1, 10)),
            date_resolved=resolved,
            description=f"Claim for {p.type.replace('_', ' ')} policy",
            fraud_risk_score=round(random.uniform(0, 30), 1),
        )
        claims.append(cl)
    db.add_all(claims)
    db.flush()

    # ── Renewals ──
    renewals = []
    renewal_statuses = ["upcoming", "in_progress", "quoted", "approved", "completed", "lost"]
    for p in policies:
        if p.status == "active" and p.expiration_date:
            days_until = (p.expiration_date - today).days
            if days_until <= 120:
                status = "upcoming" if days_until > 60 else "in_progress" if days_until > 30 else "quoted"
                premium_change = round(random.uniform(-5, 15), 1)
                proposed = round(p.premium * (1 + premium_change / 100), 2)
                priority = "critical" if days_until <= 14 else "high" if days_until <= 30 else "medium" if days_until <= 60 else "low"
                r = Renewal(
                    policy_id=p.id, client_id=p.client_id,
                    status=status, due_date=p.expiration_date,
                    premium_current=p.premium, premium_proposed=proposed,
                    premium_change_pct=premium_change,
                    assigned_to=random.choice([2, 3, 4]),
                    priority=priority,
                    last_contacted=today - timedelta(days=random.randint(1, 14)),
                )
                renewals.append(r)
    # Add some completed renewals for history
    for _ in range(8):
        p = random.choice(policies)
        r = Renewal(
            policy_id=p.id, client_id=p.client_id,
            status=random.choice(["completed", "lost"]),
            due_date=today - timedelta(days=random.randint(30, 180)),
            premium_current=p.premium,
            premium_proposed=round(p.premium * random.uniform(0.95, 1.15), 2),
            premium_change_pct=round(random.uniform(-5, 15), 1),
            assigned_to=random.choice([2, 3, 4]),
            priority="medium",
        )
        renewals.append(r)
    db.add_all(renewals)
    db.flush()

    # ── Certificates ──
    certs = []
    for i, p in enumerate(random.sample(policies, min(15, len(policies)))):
        client = next(c for c in clients if c.id == p.client_id)
        cert = Certificate(
            certificate_number=f"COI-{20000000 + i:08d}",
            client_id=p.client_id, policy_id=p.id,
            holder_name=f"Holder for {client.name}",
            holder_address=client.address,
            status="active" if p.expiration_date and p.expiration_date > today else "expired",
            issued_date=p.effective_date,
            expiration_date=p.expiration_date,
            requested_by=client.contact_name,
        )
        certs.append(cert)
    db.add_all(certs)
    db.flush()

    # ── Commissions ──
    commissions = []
    for p in policies:
        if p.status == "active":
            rate = random.choice([8, 10, 12, 15])
            comm = Commission(
                policy_id=p.id, carrier_id=p.carrier_id, client_id=p.client_id,
                broker_id=random.choice([2, 3, 4]),
                amount=round(p.premium * rate / 100, 2),
                rate=rate,
                status=random.choice(["paid", "paid", "pending"]),
                period_start=p.effective_date,
                period_end=p.expiration_date,
                paid_date=today - timedelta(days=random.randint(1, 90)) if random.random() > 0.3 else None,
            )
            commissions.append(comm)
    db.add_all(commissions)
    db.flush()

    # ── Documents ──
    docs = []
    doc_categories = ["policy", "claim", "certificate", "endorsement", "invoice"]
    for i, p in enumerate(policies[:20]):
        doc = Document(
            name=f"{p.type.replace('_', ' ').title()} - {p.policy_number}.pdf",
            file_path=f"/documents/{p.policy_number}.pdf",
            file_type="pdf", file_size=random.randint(50000, 2000000),
            category="policy", client_id=p.client_id, policy_id=p.id,
            uploaded_by=2, description=f"Policy document for {p.policy_number}",
        )
        docs.append(doc)
    db.add_all(docs)
    db.flush()

    # ── Workflows ──
    workflows = [
        Workflow(name="Renewal Reminder Workflow", type="renewal_reminder", status="active", trigger="scheduled", description="Automated renewal reminders at 90, 60, and 30 days", created_by=1,
                 steps_json=json.dumps([
                     {"step": 1, "action": "Send 90-day notice", "type": "email"},
                     {"step": 2, "action": "Send 60-day reminder", "type": "email"},
                     {"step": 3, "action": "Assign to broker for follow-up", "type": "task"},
                     {"step": 4, "action": "Send 30-day urgent reminder", "type": "email"},
                     {"step": 5, "action": "Escalate to manager", "type": "escalation"},
                 ])),
        Workflow(name="New Client Onboarding", type="custom", status="active", trigger="manual", description="Onboard new clients with proper documentation and coverage review", created_by=1,
                 steps_json=json.dumps([
                     {"step": 1, "action": "Collect business information", "type": "form"},
                     {"step": 2, "action": "Risk assessment", "type": "review"},
                     {"step": 3, "action": "Coverage recommendations", "type": "task"},
                     {"step": 4, "action": "Quote preparation", "type": "task"},
                     {"step": 5, "action": "Policy binding", "type": "task"},
                 ])),
        Workflow(name="Claims Processing", type="claims_routing", status="active", trigger="event", description="Route and process insurance claims", created_by=1,
                 steps_json=json.dumps([
                     {"step": 1, "action": "Receive claim submission", "type": "trigger"},
                     {"step": 2, "action": "Initial documentation review", "type": "review"},
                     {"step": 3, "action": "Assign adjuster", "type": "task"},
                     {"step": 4, "action": "Investigation & assessment", "type": "review"},
                     {"step": 5, "action": "Decision & settlement", "type": "approval"},
                 ])),
        Workflow(name="Certificate Generation", type="certificate_generation", status="active", trigger="manual", description="Generate and distribute certificates of insurance", created_by=1,
                 steps_json=json.dumps([
                     {"step": 1, "action": "Receive certificate request", "type": "trigger"},
                     {"step": 2, "action": "Verify policy details", "type": "review"},
                     {"step": 3, "action": "Generate certificate", "type": "automation"},
                     {"step": 4, "action": "Send to holder", "type": "email"},
                 ])),
    ]
    db.add_all(workflows)
    db.flush()

    # ── Workflow Tasks ──
    tasks = [
        WorkflowTask(workflow_id=workflows[0].id, title="Review upcoming renewals for Q1", description="Review all policies expiring in the next quarter", status="in_progress", assigned_to=2, priority="high", due_date=datetime(today.year, today.month, 28)),
        WorkflowTask(workflow_id=workflows[0].id, title="Send 60-day notices for March renewals", description="Send renewal notices to clients with March expirations", status="pending", assigned_to=3, priority="medium", due_date=datetime(today.year, today.month, 15)),
        WorkflowTask(workflow_id=workflows[1].id, title="Complete onboarding for Digital Media Partners", description="Finish gathering documentation and risk assessment", status="in_progress", assigned_to=4, priority="medium", due_date=datetime(today.year, today.month, 20)),
        WorkflowTask(workflow_id=workflows[2].id, title="Process claim CLM-005001", description="Review documentation and assign adjuster for new property damage claim", status="pending", assigned_to=2, priority="high", due_date=datetime(today.year, today.month, 10)),
        WorkflowTask(workflow_id=workflows[2].id, title="Investigation for claim CLM-005005", description="Complete field investigation for bodily injury claim", status="in_progress", assigned_to=3, priority="critical", due_date=datetime(today.year, today.month, 8)),
        WorkflowTask(workflow_id=workflows[3].id, title="Generate certificates for Apex Manufacturing", description="Bulk certificate generation for all active policies", status="pending", assigned_to=2, priority="low", due_date=datetime(today.year, today.month, 25)),
    ]
    db.add_all(tasks)

    db.commit()
    print("Database seeded successfully!")
