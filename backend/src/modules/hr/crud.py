from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models import HR
from typing import Optional


class HRDatabase():
    async def create_hr(db: AsyncSession, hr: HR) -> HR:
        db.add(hr)
        await db.commit()
        await db.refresh(hr)
        return hr

    async def get_hr_by_id(db: AsyncSession, hr_id: int) -> Optional[HR]:
        query = select(HR).filter(HR.id == hr_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_hr_by_email(db: AsyncSession, email: str) -> Optional[HR]:
        query = select(HR).filter(HR.email == email)
        result = await db.execute(query)
        return result.scalars().first()

    async def update_hr(db: AsyncSession, hr: HR) -> HR:
        await db.commit()
        await db.refresh(hr)
        return hr