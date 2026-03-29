from typing import AsyncGenerator

from advanced_alchemy.extensions.fastapi import SQLAlchemyAsyncConfig, AsyncSessionConfig
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine.url import URL

from src.config import settings


if settings.DATABASE_URL:
    conn_string = settings.DATABASE_URL
else:
    if not all([settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_DB, settings.POSTGRES_HOST, settings.POSTGRES_PORT]):
        raise RuntimeError("Set DATABASE_URL or all POSTGRES_* vars in .env")
    conn_string = URL.create(
        "postgresql+asyncpg",
        username=settings.POSTGRES_USER,
        database=settings.POSTGRES_DB,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
    )

session_config = AsyncSessionConfig(expire_on_commit=False)

sqlalchemy_config = SQLAlchemyAsyncConfig(
    connection_string=conn_string,
    session_config=session_config,
    create_all=True,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with sqlalchemy_config.get_session() as session:
        yield session
