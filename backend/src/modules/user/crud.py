from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from src.models import User


class UserDatabase():
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        return result.scalars().first()

    async def create_user(self, db: AsyncSession, user: User) -> User:
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        query = select(User).filter(User.id == user_id)
        result = await db.execute(query)
        return result.scalars().one_or_none()