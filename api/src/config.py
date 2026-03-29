from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Set DATABASE_URL to use SQLite in dev (e.g. sqlite+aiosqlite:///./dev.db)
    # Leave unset to build URL from POSTGRES_* vars below (prod default)
    DATABASE_URL: Optional[str] = None

    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_HOST: Optional[str] = None
    POSTGRES_PORT: Optional[int] = None

    # Auth settings MUST come from the environment (.env in dev)
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # CORS MUST come from the environment
    CORS_ORIGINS: str

    # First-run seed pastor (optional — used only when no users exist)
    SEED_PASTOR_NAME: Optional[str] = None
    SEED_PASTOR_EMAIL: Optional[str] = None
    SEED_PASTOR_PASSWORD: Optional[str] = None

    # Always load the API's .env, regardless of where the process is started from.
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
