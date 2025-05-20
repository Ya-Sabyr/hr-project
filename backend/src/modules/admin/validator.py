from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from src.models import Admin

class AdminValidator:
    @staticmethod
    async def check_email_exists(db: AsyncSession, email: str):
        admin = await db.execute(select(Admin).filter(Admin.email == email))
        if admin.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
