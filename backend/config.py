from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Lockton Insurance Platform"
    DATABASE_URL: str = "sqlite:///./lockton.db"
    SECRET_KEY: str = "lockton-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    OPENAI_API_KEY: str = ""
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
