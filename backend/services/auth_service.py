from sqlalchemy.orm import Session
from models.user import User
from middleware.auth import verify_password, get_password_hash, create_access_token


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, email: str, password: str, full_name: str, role: str = "broker", **kwargs):
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role,
        **kwargs,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def generate_token(user: User) -> dict:
    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}
