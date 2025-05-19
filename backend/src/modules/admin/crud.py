from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from src.models import User, HR, Admin

# ADMIN QUERIES
class AdminDatabase():
    async def get_admin_by_email(db: AsyncSession, email: str) -> Optional[Admin]:
        query = select(Admin).filter(Admin.email == email)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_admin_by_id(db: AsyncSession, admin_id: int) -> Optional[Admin]:
        query = select(Admin).filter(Admin.id == admin_id)
        result = await db.execute(query)
        return result.scalars().first()

# USER QUERIES 
class AdminUserDatabase():
    async def get_all_users(db: AsyncSession) -> List[User]:
        query = select(User)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        query = select(User).filter(User.id == user_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def delete_user(db: AsyncSession, user: User):
        await db.delete(user)
        await db.commit()

    async def toggle_user_block_status(db: AsyncSession, user: User) -> User:
        user.blocked = not user.blocked
        await db.commit()
        await db.refresh(user)
        return user

# HR QUERIES 
class AdminHRDatabase():
    async def get_all_hrs(db: AsyncSession) -> List[HR]:
        query = select(HR)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_hr_by_id(db: AsyncSession, hr_id: int) -> Optional[HR]:
        query = select(HR).filter(HR.id == hr_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_pending_hrs(db: AsyncSession) -> List[HR]:
        query = select(HR).filter(HR.approved == False)
        result = await db.execute(query)
        return result.scalars().all()

    async def delete_hr(db: AsyncSession, hr: HR):
        await db.delete(hr)
        await db.commit()

    async def approve_hr(db: AsyncSession, hr: HR) -> HR:
        hr.approved = True
        await db.commit()
        await db.refresh(hr)
        return hr

    async def toggle_hr_block_status(db: AsyncSession, hr: HR) -> HR:
        hr.blocked = not hr.blocked
        await db.commit()
        await db.refresh(hr)
        return hr
