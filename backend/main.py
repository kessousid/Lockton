from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from config import settings
from seed_data import seed_database

# Import all models to register them
import models  # noqa: F401

from routers import auth, clients, policies, claims, carriers, renewals, certificates, analytics, documents, workflows, ai

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(carriers.router)
app.include_router(renewals.router)
app.include_router(certificates.router)
app.include_router(analytics.router)
app.include_router(documents.router)
app.include_router(workflows.router)
app.include_router(ai.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/api/notifications")
def notifications():
    from services.notification_service import get_notifications
    db = SessionLocal()
    try:
        return get_notifications(db)
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
