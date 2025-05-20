from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models import Application, ApplicationStatusEnum, Resume, Vacancy
from fastapi import HTTPException
from sqlalchemy.orm import joinedload


class ApplicationDatabase():
    async def get_application_by_id(self, db: AsyncSession, application_id: int):
        result = await db.execute(select(Application).where(Application.id == application_id))
        return result.scalar_one_or_none()

    async def get_existing_application(self, db: AsyncSession, user_id: int, vacancy_id: int) -> Optional[Application]:
        query = select(Application).filter(Application.user_id == user_id, Application.vacancy_id == vacancy_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def update_application_status(self, db: AsyncSession, application_id: int, status: ApplicationStatusEnum):
        result = await db.execute(select(Application).filter(Application.id == application_id))
        application = result.scalar_one_or_none()

        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        application.status = status
        await db.commit()
        await db.refresh(application)
        return application

    async def create_application(self, db: AsyncSession, user_id: int, vacancy_id: int, resume_id: int, matching_score: int, summary: str, resume_path: str):
        application = Application(
            user_id=user_id,
            vacancy_id=vacancy_id,
            resume_id=resume_id,
            status=ApplicationStatusEnum.pending,
            matching_score=matching_score,
            summary=summary,
            resume_path=resume_path
        )

        db.add(application)
        await db.commit()
        await db.refresh(application)
        return application

    async def get_applications_by_user(self, db: AsyncSession, user_id: int):
        result = await db.execute(
            select(Application)
            .filter(Application.user_id == user_id)
            .options(joinedload(Application.vacancy)) 
        )
        return result.scalars().all()
