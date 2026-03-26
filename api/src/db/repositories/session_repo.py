from advanced_alchemy.repository import SQLAlchemyAsyncRepository
from src.db.models.session import OutreachSession


class SessionRepository(SQLAlchemyAsyncRepository[OutreachSession]):
    model_type = OutreachSession
