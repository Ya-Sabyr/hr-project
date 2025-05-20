from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging
from src.modules.admin.validator import AdminValidator
from src.modules.admin.schemas import AdminCreate
from src.modules.user.utils import hash_password

from src.modules.admin.crud import AdminDatabase
from src.models import Admin

class AdminService:
    def __init__(self, admin_database: AdminDatabase):
        self.admin_database = admin_database

    async def create_admin(self, db: AsyncSession, obj_in: AdminCreate) -> Admin:
        logging.debug(f"Creating admin: {obj_in}")
        obj_in_data = obj_in.dict()

        if obj_in_data["password"]:
            obj_in_data["password"] = await hash_password(obj_in_data["password"])

        await AdminValidator.check_email_exists(db, obj_in_data["email"])

        db_obj = Admin(**obj_in_data)
        return await self.admin_database.create_admin(db, db_obj)

    async def get_admin_by_email(self, db: AsyncSession, email: str) -> Optional[Admin]:
        logging.info(f"[ADMIN FETCH] Searching admin by email: {email}")
        
        admin = await self.admin_database.get_admin_by_email(db, email)
        if not admin:
            logging.warning(f"❗ [ADMIN NOT FOUND] No admin found with email {email}")
        else:
            logging.info(f"✅ [ADMIN FOUND] Admin {email} retrieved successfully")
            
        return admin
    
    async def get_admin_by_id(self, db: AsyncSession, admin_id: int) -> Optional[Admin]:
        logging.info(f"[ADMIN FETCH] Searching admin by ID: {admin_id}")
        
        admin = await self.admin_database.get_admin_by_id(db, admin_id)
        if not admin:
            logging.warning(f"❗ [ADMIN NOT FOUND] No admin found with ID {admin_id}")
        else:
            logging.info(f"✅ [ADMIN FOUND] Admin ID {admin_id} retrieved successfully")
        
        return admin
