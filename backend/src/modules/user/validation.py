from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from src.models import User

class UserValidator:
    @staticmethod
    async def check_email_exists(db: AsyncSession, email: str):
        user = await db.execute(select(User).filter(User.email == email))
        if user.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
