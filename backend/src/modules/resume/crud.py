from src.models import Resume
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import ResumeCreate

class ResumeDatabase():
    async def get_resume_by_id(db: AsyncSession, resume_id: int):
        result = await db.execute(select(Resume).where(Resume.id == resume_id))
        return result.scalar_one_or_none()

    async def create_resume(db: AsyncSession, resume_data: ResumeCreate) -> Resume:
        resume = Resume(**resume_data.model_dump())  
        db.add(resume)
        try:
            await db.commit()
            await db.refresh(resume)
        except:
            await db.rollback()
            raise
        return resume


    async def get_resumes_by_user_id(db: AsyncSession, user_id: int):
        result = await db.execute(select(Resume).where(Resume.user_id == user_id))
        return result.scalars().all()