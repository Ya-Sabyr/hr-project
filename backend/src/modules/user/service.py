from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from fastapi import HTTPException
from src.models import User
from .schemas import UserCreate
from .utils import hash_password
from .crud import UserDatabase
from .validation import UserValidator
import logging

class UserService:
    def __init__(self, user_database = UserDatabase):
        self.user_database = user_database
    async def create_user(self, db: AsyncSession, obj_in: UserCreate) -> User:
        logging.debug(f"Creating user: {obj_in}")
        obj_in_data = obj_in.dict()

        if obj_in_data["password"]:
            obj_in_data["password"] = await hash_password(obj_in_data["password"])

        await UserValidator.check_email_exists(db, obj_in_data["email"])

        db_obj = User(**obj_in_data)
        return await self.user_database.create_user(db, db_obj)

    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        return await self.user_database.get_user_by_email(db, email)
    
    async def get_user_by_id(self, db:AsyncSession, user_id: int) -> Optional[User]:
        return await self.user_database.get_user_by_id(db, user_id)
