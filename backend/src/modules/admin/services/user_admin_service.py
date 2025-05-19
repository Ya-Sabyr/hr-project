from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import List
import logging

from src.modules.admin.crud import AdminUserDatabase
from src.models import User

class UserAdminService:
    def __init__(self, admin_user_db: AdminUserDatabase):
        self.admin_user_db = admin_user_db

    async def get_all_users(self, db: AsyncSession) -> List[User]:
        logging.info("[USER FETCH] Fetching all users")
        return await self.admin_user_db.get_all_users(db)

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User:
        logging.info(f"[USER FETCH] Fetching user by ID: {user_id}")
        user = await self.admin_user_db.get_user_by_id(db, user_id)
        if not user:
            logging.warning(f"❗ [USER NOT FOUND] User with ID {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")
        logging.info(f"✅ [USER FOUND] User with ID {user_id} retrieved successfully")
        return user

    async def delete_user(self, db: AsyncSession, user_id: int):
        logging.info(f"[USER DELETE] Deleting user with ID: {user_id}")
        user = await self.get_user_by_id(db, user_id)
        await self.admin_user_db.delete_user(db, user)
        logging.info(f"✅ [USER DELETED] User {user.email} deleted successfully")

    async def toggle_user_block_status(self, db: AsyncSession, user_id: int):
        logging.info(f"[USER BLOCK TOGGLE] Toggling block status for user ID: {user_id}")
        user = await self.get_user_by_id(db, user_id)
        user.blocked = not user.blocked  
        await db.commit()
        await db.refresh(user)
        status = "blocked" if user.blocked else "unblocked"
        logging.info(f"✅ [USER STATUS TOGGLED] User {user.email} has been {status}")
        return {"message": f"User {user.email} has been {status}"}

