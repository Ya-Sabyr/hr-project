import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import List
from src.models import Vacancy, VacancyStatusEnum
from .crud import VacancyDatabase
from .schemas import VacancyCreate, VacancyUpdate, VacancyInDBBase, VacancyStatusUpdate, VacancyPublic
from src.modules.application.schemas import CandidateResponseSchema
from langchain_openai import AzureChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableLambda
import json
from src.core.config import BackendConfig


class VacancyService:
    def __init__(self, vacancy_database = VacancyDatabase, llm = AzureChatOpenAI):
        self.llm = llm
        self.vacancy_database = vacancy_database

    async def classify_vacancy_with_ai(self, description: str) -> list[dict]:
        logging.info("[AI CLASSIFY] Analyzing vacancy description")

        messages = [
            SystemMessage(content=(
                "Ты эксперт по классификации вакансий. Твоя задача — определить 3-5 подходящих профессий и их уровней, "
                "основываясь на описании вакансии. Если вакансия содержит только одну профессию, предложи другие релевантные профессии. "
                "Если профессия не подразумевает формальных уровней (Junior, Middle, Senior) — как, например, бухгалтер, кассир, водитель — "
                "укажи grade как 'не указано'. Не делай вывод о грейде только по опыту. "
                "Если в вакансии указан стажер, используй grade 'Intern'. "
                "Обязательно возвращай результат СТРОГО в виде строки с JSON, БЕЗ форматирования Markdown, "
                "БЕЗ обёртки ```json и ``` — только чистый JSON, пример: "
                '[{"profession": "Аналитик данных", "grade": "Middle"}, {"profession": "Официант", "grade": "не указано"}].'
            )),
            HumanMessage(content=f"Описание вакансии: {description}\n\nКакие профессии и уровни соответствуют этому описанию?")
        ]

        try:
            response = await self.llm.ainvoke(messages)
        except Exception as e:
            logging.error(f"[AI ERROR] OpenAI request failed: {e}")
            raise ValueError("Error during AI query")

        if not isinstance(response.content, str):
            logging.error(f"[AI CLASSIFICATION ERROR] Expected string, got {type(response.content)}")
            raise ValueError("AI returned data in an incorrect format")

        try:
            professions = json.loads(response.content.strip())

            if not isinstance(professions, list):
                logging.error(f"[AI CLASSIFICATION ERROR] Expected list, got {type(professions)}")
                raise ValueError("AI returned data in an incorrect format")

            for p in professions:
                if not isinstance(p, dict) or "profession" not in p or "grade" not in p:
                    logging.error(f"[AI CLASSIFICATION ERROR] Invalid profession format: {p}")
                    raise ValueError(f"Incorrect format of the profession: {p}")

                if p["grade"] == "":
                    logging.warning(f"[AI CLASSIFICATION WARNING] Empty grade for profession: {p.get('profession')}, replacing with 'не указано'")
                    p["grade"] = "не указано"
                    
            logging.info(f"[AI CLASSIFICATION SUCCESS] Suggested professions: {professions}")
            return professions

        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"[AI CLASSIFICATION ERROR] Invalid AI response: {response.content} | Exception: {e}")
            raise ValueError(f"AI returned incorrect JSON: {str(e)}")
        
    async def create_vacancy(self, db: AsyncSession, vacancy_data: VacancyCreate, hr):
        logging.info(f"[VACANCY CREATE] Creating vacancy for HR ID {hr.id}")

        suggested_professions = await self.classify_vacancy_with_ai(vacancy_data.description)
        if not suggested_professions:
            raise HTTPException(status_code=400, detail="AI could not identify the occupation. Clarify the description.")

    
        valid_options = {(p["profession"], p["grade"]) for p in suggested_professions}


        vacancy = Vacancy(**vacancy_data.model_dump(), hr_id=hr.id, company=hr.company)
        new_vacancy = await self.vacancy_database.create_vacancy(db=db, vacancy=vacancy)

        logging.info(f"✅ [VACANCY CREATED] Vacancy ID {new_vacancy.id} created successfully")
        return new_vacancy

    async def get_vacancy_by_id(self, db: AsyncSession, vacancy_id: int) -> VacancyInDBBase:
        logging.info(f"[VACANCY FETCH] Fetching vacancy ID {vacancy_id}")

        vacancy = await self.vacancy_database.get_vacancy_by_id(db, vacancy_id)
        if not vacancy:
            logging.warning(f"❗ [VACANCY FETCH] Vacancy ID {vacancy_id} not found")
            raise HTTPException(status_code=404, detail="Vacancy not found or not owned by HR")

        logging.info(f"✅ [VACANCY FETCH] Vacancy {vacancy.id} retrieved successfully")
        return vacancy

    async def get_vacancies_by_hr(self, db: AsyncSession, hr) -> List[VacancyInDBBase]:
        logging.info(f"[VACANCY FETCH] Fetching vacancies for HR ID {hr.id}")
        return await self.vacancy_database.get_vacancies_by_hr(db, hr.id)

    async def update_vacancy(self, db: AsyncSession, vacancy_id: int, vacancy_data: VacancyUpdate) -> VacancyInDBBase:
        logging.info(f"[VACANCY UPDATE] Attempting to update vacancy ID {vacancy_id}")

        vacancy = await self.get_vacancy_by_id(db, vacancy_id)

        if vacancy.status == VacancyStatusEnum.accepted:
            logging.warning(f"❗ [VACANCY UPDATE] Cannot edit accepted vacancy ID {vacancy_id}")
            raise HTTPException(
                status_code=403,
                detail="Cannot edit an accepted vacancy. Contact admin for changes."
            )

        update_data = vacancy_data.model_dump(exclude_unset=True)

        if vacancy.status == VacancyStatusEnum.rejected:
            update_data["status"] = VacancyStatusEnum.under_review

        for field, value in update_data.items():
            setattr(vacancy, field, value)

        updated_vacancy = await self.vacancy_database.update_vacancy(db, vacancy)

        logging.info(f"✅ [VACANCY UPDATED] Vacancy ID {updated_vacancy.id} updated successfully")
        return updated_vacancy


    async def delete_vacancy(self, db: AsyncSession, vacancy_id: int):
        logging.info(f"[VACANCY DELETE] Attempting to delete vacancy ID {vacancy_id}")

        vacancy = await self.get_vacancy_by_id(db, vacancy_id)

        if vacancy.status == VacancyStatusEnum.accepted:
            logging.warning(f"❗ [VACANCY DELETE] Cannot delete accepted vacancy ID {vacancy_id}")
            raise HTTPException(
                status_code=403,
                detail="Cannot delete an accepted vacancy. Contact admin for removal."
            )

        await self.vacancy_database.delete_vacancy(db, vacancy)
        logging.info(f"✅ [VACANCY DELETED] Vacancy ID {vacancy_id} deleted successfully")

    async def update_vacancy_status(self, db: AsyncSession, vacancy_id: int, status_data: VacancyStatusUpdate) -> VacancyInDBBase:
        logging.info(f"[VACANCY STATUS UPDATE] Updating status for vacancy ID {vacancy_id} to {status_data.status}")

        vacancy = await self.vacancy_database.get_vacancy_by_id(db, vacancy_id)
        if not vacancy:
            logging.warning(f"❗ [VACANCY STATUS UPDATE] Vacancy ID {vacancy_id} not found")
            raise HTTPException(status_code=404, detail="Vacancy not found")

        updated_vacancy = await self.vacancy_database.update_vacancy_status(db, vacancy, status_data.status)

        logging.info(f"✅ [VACANCY STATUS UPDATED] Vacancy ID {vacancy_id} status updated to {updated_vacancy.status}")
        return updated_vacancy

    async def get_vacancies_under_review(self, db: AsyncSession) -> List[VacancyInDBBase]:
        logging.info("[VACANCY FETCH] Fetching vacancies with status 'Under review'")
        vacancies = await self.vacancy_database.get_vacancies_by_status(db, VacancyStatusEnum.under_review)
        return vacancies
    
    async def get_accepted_vacancies_for_users(self, db: AsyncSession) -> List[VacancyPublic]:
        logging.info("[VACANCY FETCH] Fetching accepted vacancies for users")
        vacancies = await self.vacancy_database.get_vacancies_by_status(db, VacancyStatusEnum.accepted)
        return vacancies
    
    async def get_accepted_vacancy_by_id(self, db: AsyncSession, vacancy_id: int) -> VacancyPublic:
        logging.info(f"[VACANCY FETCH] Fetching accepted vacancy with ID {vacancy_id}")

        vacancy = await self.vacancy_database.get_accepted_vacancy_by_id(db, vacancy_id)

        if not vacancy:
            logging.warning(f"❗ [VACANCY FETCH] Accepted vacancy ID {vacancy_id} not found")
            raise HTTPException(status_code=404, detail="Accepted vacancy not found")

        return vacancy

    async def fetch_candidates_by_vacancy(self, db: AsyncSession, vacancy_id: int) -> List[CandidateResponseSchema]:
        logging.info(f"[CANDIDATES] Fetching candidates for vacancy {vacancy_id}")
        candidates = await self.vacancy_database.get_candidates_by_vacancy(db, vacancy_id)
        logging.info(f"[CANDIDATES FOUND] Found {len(candidates)} candidates for vacancy {vacancy_id}")
        return [CandidateResponseSchema(**candidate) for candidate in candidates]

    async def get_applied_vacancies(self, db: AsyncSession, user_id: int) -> List[int]:
        logging.info(f"Fetching applied vacancies for user with ID {user_id}")
        applied_vacancies = await self.vacancy_database.get_applied_vacancies(db, user_id)
        return applied_vacancies

    async def get_applied_vacancy_details(self, db: AsyncSession, user_id: int) -> List[VacancyPublic]:
        logging.info(f"Fetching applied vacancy details for user with ID {user_id}")
        vacancies = await self.vacancy_database.get_applied_vacancy_details(db, user_id)
        return [VacancyPublic(**vacancy.__dict__) for vacancy in vacancies]
