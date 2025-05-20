import logging
import json
from fastapi import HTTPException
from langchain_openai import AzureChatOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import Resume, Vacancy, ApplicationStatusEnum
from .crud import ApplicationDatabase
from src.modules.vacancy.service import VacancyService
from src.modules.resume.service import ResumeService
import re
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

logging.basicConfig(level=logging.INFO)

class ApplicationService:
    def __init__(
        self,
        application_database = ApplicationDatabase,
        vacancy_service = VacancyService,
        resume_service = ResumeService,
        llm = AzureChatOpenAI
    ):
        self.application_database = application_database
        self.vacancy_service = vacancy_service
        self.resume_service = resume_service
        self.llm = llm

    async def analyze_matching(self, resume: Resume, vacancy: Vacancy) -> dict:
        logging.info(f"[MATCHING RESUME AND VACANCY] Analyzing match for resume {resume.id} and vacancy {vacancy.id}")

        if not self.llm:
            logging.error("[MATCHING ERROR] LLM not configured")
            raise ValueError("LLM dependency is not configured")

        if isinstance(resume.skills, list):
            resume_skills = ", ".join(resume.skills)
        else:
            resume_skills = resume.skills

        vacancy_skills = vacancy.skills

        profession = resume.profession if resume.profession else 'Не указано'

        prompt = PromptTemplate(
            input_variables=["first_name", "last_name", "experience_time", "profession", "resume_skills", "vacancy_title",
                            "vacancy_description", "vacancy_experience_time", "vacancy_skills", "score", "analysis"],
            template=(
                "Ты AI, анализирующий соответствие резюме и вакансий. "
                "Оценивай справедливо и будь кратким (не более 5-7 предложений).\n\n"
                "Кандидат:\n"
                "- Имя: {first_name} {last_name}\n"
                "- Опыт: {experience_time} лет\n"
                "- Навыки: {resume_skills}\n"
                "- Профессия: {profession}\n\n"
                "Вакансия:\n"
                "- Должность: {vacancy_title}\n"
                "- Описание: {vacancy_description}\n"
                "- Требуемый опыт: {vacancy_experience_time}\n"
                "- Навыки: {vacancy_skills}\n\n"
                "Оцени соответствие резюме и вакансии по шкале от 0 до 100, а также укажи, "
                "какие навыки отсутствуют и как их можно развить.\n\n"
                "Ответь в формате:\n"
                "- Соответствие: {score}\n"
                "- Пояснение: {analysis}\n"
            )
        )

        chain = prompt | self.llm | RunnableLambda(lambda x: x.content.strip() if hasattr(x, "content") else str(x).strip())

        try:
            response = await chain.ainvoke({
                "first_name": resume.first_name,
                "last_name": resume.last_name,
                "experience_time": resume.experience_time,
                "profession": profession,
                "resume_skills": resume_skills,
                "vacancy_title": vacancy.title,
                "vacancy_description": vacancy.description,
                "vacancy_experience_time": vacancy.experience_time,
                "vacancy_skills": vacancy_skills,
                "score": '',
                "analysis": ''
            })

            logging.info(f"[MATCHING SUCCESS] Response from Langchain: {response}")

            score = self.extract_score(response)
            logging.info(f"[MATCHING SUCCESS] Resume {resume.id} matched with vacancy {vacancy.id} (Score: {score})")

            return {
                "matching": {
                    "score": score,
                    "summary": response
                }
            }

        except Exception as e:
            logging.error(f"[MATCHING ERROR] Error analyzing resume {resume.id} and vacancy {vacancy.id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error processing matching with Langchain")

    def extract_score(self, text: str) -> int:
        logging.info("[MATCHING SCORE] Extracting a number from 0 to 100 from text")

        if not text:
            logging.error("[MATCHING SCORE ERROR] Empty response text")
            return 50

        match = re.search(r"Соответствие:\s*(\d{1,3})", text)

        if match:
            score = int(match.group(1))
            logging.info(f"[MATCHING SCORE] Extracted score: {score}")
            return score
        else:
            logging.error("[MATCHING SCORE ERROR] No match for 'Соответствие: <число>' found")
            return 50

    async def create_application(self, db: AsyncSession, user_id: int, vacancy_id: int, resume_id: int):
        logging.info(f"[APPLICATION] Creating application for user {user_id}, vacancy {vacancy_id}, resume {resume_id}")

        if not self.vacancy_service or not self.resume_service:
            logging.error("[APPLICATION ERROR] VacancyService or ResumeService not configured")
            raise ValueError("VacancyService or ResumeService dependency is not configured")

        applied_vacancies = await self.vacancy_service.get_applied_vacancies(db, user_id)
        if vacancy_id in applied_vacancies:
            logging.warning(f"[APPLICATION DUPLICATE] User {user_id} already applied for vacancy {vacancy_id}")
            raise ValueError("You have already applied for this vacancy")

        accepted_vacancy = await self.vacancy_service.get_accepted_vacancy_by_id(db, vacancy_id)
        if not accepted_vacancy:
            logging.warning(f"[APPLICATION ERROR] Vacancy {vacancy_id} is not accepted")
            raise ValueError("This vacancy has not yet been approved. You cannot apply")

        resume = await self.resume_service.get_resume_by_id(db, resume_id)
        vacancy = await self.vacancy_service.get_vacancy_by_id(db, vacancy_id)

        if not resume or not vacancy:
            logging.error(f"[APPLICATION ERROR] Resume {resume_id} or Vacancy {vacancy_id} not found for user {user_id}")
            raise ValueError("No resume or vacancy found")

        matching_result = await self.analyze_matching(resume, vacancy)

        application = await self.application_database.create_application(
            db, user_id, vacancy_id, resume_id,
            matching_result["matching"]["score"],
            matching_result["matching"]["summary"],
            resume.resume_link
        )

        logging.info(f"[APPLICATION SUCCESS] User {user_id} applied to vacancy {vacancy_id} with matching score {matching_result['matching']['score']}")
        return application

    async def accept_candidate(self, db: AsyncSession, application_id: int):
        logging.info(f"[APPLICATION] Accepting candidate for application {application_id}")
        application = await self.application_database.update_application_status(db, application_id, ApplicationStatusEnum.accepted)
        logging.info(f"[APPLICATION ACCEPTED] Application {application_id} accepted")
        return application

    async def reject_candidate(self, db: AsyncSession, application_id: int):
        logging.info(f"[APPLICATION] Rejecting candidate for application {application_id}")
        application = await self.application_database.update_application_status(db, application_id, ApplicationStatusEnum.rejected)
        logging.info(f"[APPLICATION REJECTED] Application {application_id} rejected")
        return application

    async def get_user_applications(self, db: AsyncSession, user_id: int):
        logging.info(f"[USER APPLICATIONS] Fetching applications for user {user_id}")
        applications = await self.application_database.get_applications_by_user(db, user_id)

        response = []
        for application in applications:
            response.append({
                "status": application.status,
                "vacancy_title": application.vacancy.title,
                "matching_score": application.matching_score
            })

        logging.info(f"[USER APPLICATIONS FETCHED] Found {len(applications)} applications for user {user_id}")
        return response