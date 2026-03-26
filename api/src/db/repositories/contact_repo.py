from advanced_alchemy.repository import SQLAlchemyAsyncRepository
from src.db.models.contact import Contact


class ContactRepository(SQLAlchemyAsyncRepository[Contact]):
    model_type = Contact
