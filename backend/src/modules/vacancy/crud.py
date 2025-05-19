from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from src.models import Vacancy, VacancyStatusEnum, Application, Resume


class VacancyDatabase():
    async def create_vacancy(db: AsyncSession, vacancy: Vacancy) -> Vacancy:
        db.add(vacancy)
        await db.commit()
        await db.refresh(vacancy)
        return vacancy

    async def get_vacancy_by_id(db: AsyncSession, vacancy_id: int) -> Optional[Vacancy]:
        query = select(Vacancy).filter(Vacancy.id == vacancy_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_vacancies_by_hr(db: AsyncSession, hr_id: int) -> List[Vacancy]:
        query = select(Vacancy).filter(Vacancy.hr_id == hr_id)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_vacancies_by_status(db: AsyncSession, status: VacancyStatusEnum) -> List[Vacancy]:
        query = select(Vacancy).filter(Vacancy.status == status)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_accepted_vacancy_by_id(db: AsyncSession, vacancy_id: int) -> Optional[Vacancy]:
        query = select(Vacancy).filter(
            Vacancy.id == vacancy_id, 
            Vacancy.status == VacancyStatusEnum.accepted
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def update_vacancy(db: AsyncSession, vacancy: Vacancy) -> Vacancy:
        await db.commit()
        await db.refresh(vacancy)
        return vacancy

    async def delete_vacancy(db: AsyncSession, vacancy: Vacancy):
        await db.delete(vacancy)
        await db.commit()

    async def update_vacancy_status(db: AsyncSession, vacancy: Vacancy, new_status: VacancyStatusEnum) -> Vacancy:
        vacancy.status = new_status
        await db.commit()
        await db.refresh(vacancy)
        return vacancy

    async def get_applied_vacancies(db: AsyncSession, user_id: int) -> List[int]:
        result = await db.execute(select(Application.vacancy_id).filter(Application.user_id == user_id))
        return list(result.scalars().all())

    async def get_applied_vacancy_details(db: AsyncSession, user_id: int) -> List[Vacancy]:
        result = await db.execute(
            select(Vacancy)
            .join(Application, Application.vacancy_id == Vacancy.id)
            .filter(Application.user_id == user_id)
        )
        return result.scalars().all()


    async def get_candidates_by_vacancy(db: AsyncSession, vacancy_id: int):
        query = select(
            Application.id.label("application_id"),
            Resume.first_name,
            Resume.last_name,
            Resume.email,
            Resume.resume_link,
            Resume.profession,
            Application.matching_score,
            Application.summary,
            Application.status
        ).join(Application, Application.resume_id == Resume.id) \
        .join(Vacancy, Vacancy.id == Application.vacancy_id) \
        .filter(Application.vacancy_id == vacancy_id)

        result = await db.execute(query)
        candidates = result.mappings().all()

        return candidates