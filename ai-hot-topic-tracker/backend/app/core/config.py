import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./ai_tracker.db"
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    
    # App Settings
    APP_NAME: str = "AI Hot Topic Tracker"
    DEBUG: bool = False
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"

settings = Settings()
