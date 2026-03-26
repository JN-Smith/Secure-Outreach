from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    JWT_SECRET: str = "change-this-before-going-live"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: str = "http://localhost:5000"

    # First-run seed pastor (optional — used only when no users exist)
    SEED_PASTOR_NAME: str = ""
    SEED_PASTOR_EMAIL: str = ""
    SEED_PASTOR_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
