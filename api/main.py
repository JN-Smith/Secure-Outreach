from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from advanced_alchemy.extensions.fastapi import AdvancedAlchemy

from src.config import settings
from src.db.setup import sqlalchemy_config
from src.db.routes.auth import auth_router
from src.db.routes.users import users_router
from src.db.routes.contacts import contacts_router
from src.db.routes.teams import teams_router
from src.db.routes.sessions import sessions_router
from src.db.routes.dashboard import dashboard_router

# Import models so SQLAlchemy registers them for create_all
import src.db.models.user  # noqa: F401
import src.db.models.team  # noqa: F401
import src.db.models.contact  # noqa: F401
import src.db.models.session  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed first pastor if credentials are configured and no users exist
    if settings.SEED_PASTOR_EMAIL and settings.SEED_PASTOR_PASSWORD and settings.SEED_PASTOR_NAME:
        from src.db.setup import get_session
        from src.services.auth_service import user_count, create_user
        from src.schemas.auth import UserCreate

        async for db in get_session():
            if await user_count(db) == 0:
                await create_user(
                    db,
                    UserCreate(
                        full_name=settings.SEED_PASTOR_NAME,
                        email=settings.SEED_PASTOR_EMAIL,
                        password=settings.SEED_PASTOR_PASSWORD,
                        role="pastor",
                    ),
                )
                print(f"[startup] Seeded pastor: {settings.SEED_PASTOR_EMAIL}")
    yield


app = FastAPI(
    title="Secure Outreach API",
    description="API for managing evangelism outreach operations.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

alchemy = AdvancedAlchemy(config=sqlalchemy_config, app=app)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(contacts_router)
app.include_router(teams_router)
app.include_router(sessions_router)
app.include_router(dashboard_router)
