# src/modules/resume/service.py
from typing import Union
import uuid
import json
import logging
from datetime import datetime
import httpx
from azure.storage.blob.aio import BlobServiceClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, UploadFile
from backend.src.core.config import BackendConfig
import fitz
from .crud import ResumeDatabase
from .schemas import ResumeCreate
import xml.etree.ElementTree as ET
from io import BytesIO
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

logging.basicConfig(level=logging.INFO)

class ResumeService:
    def __init__(
        self,
        resume_database=ResumeDatabase,
        llm=None,
        blob_service_client: BlobServiceClient = None,
        container_name: str = None
    ):
        self.resume_database = resume_database
        self.llm = llm
        self.blob_service_client = blob_service_client
        self.container_name = container_name

    async def save_resume(self, file: Union[UploadFile, bytes]) -> str:
        logging.info("[RESUME UPLOAD] Uploading resume into Azure Blob Storage")
        if not self.blob_service_client or not self.container_name:
            logging.error("[RESUME UPLOAD] BlobServiceClient or container_name not configured")
            raise ValueError("BlobServiceClient or container_name not configured")

        try:
            if isinstance(file, UploadFile):
                file_bytes = await file.read()
                filename = file.filename
            else:
                file_bytes = file
                filename = f"{uuid.uuid4()}.pdf"

            logging.info(f"[RESUME UPLOAD] Uploading file: {filename}")

            blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=filename)
            file_stream = BytesIO(file_bytes)
            await blob_client.upload_blob(file_stream, overwrite=True)

            resume_url = f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.container_name}/{filename}"
            logging.info(f"[RESUME UPLOAD] File uploaded successfully: {resume_url}")
            return resume_url
        except Exception as e:
            logging.error(f"[RESUME UPLOAD ERROR] Failed to upload file: {str(e)}", exc_info=True)
            raise

    async def analyze_resume(self, resume_text: str) -> dict:
        logging.info("[RESUME ANALYSIS] Sending resume to OpenAI for analysis.")
        if not self.llm:
            logging.error("[RESUME ANALYSIS] LLM not configured")
            raise ValueError("LLM dependency is not configured")

        if not resume_text or not resume_text.strip():
            logging.error("[RESUME ANALYSIS] Empty resume text received")
            raise HTTPException(status_code=400, detail="Resume text is empty")

        prompt = PromptTemplate(
            input_variables=["resume_text"],
            template=(
                "Ты анализируешь резюме кандидата и извлекаешь ключевую информацию...\n\n"
                "Отвечай ТОЛЬКО JSON, без пояснений и комментариев. JSON должен быть корректным и валидным.\n\n"
                "1 Определи язык текста (русский, английский, казахский).\n"
                "2 Извлеки следующую информацию:\n"
                "- Имя и фамилию (если есть отчество, не включай его).\n"
                "- Email и телефон (если есть).\n"
                "- Общий опыт работы в годах (вычисли по датам работы, даже если есть пересечения)."
                "Если не указано опыта работы значит его нет - 0 лет"
                "Если в тексте указано 'н.в.', 'present' или аналогичное, используй текущий год.\n"
                "- Профессию (основную роль, если указано несколько — выбери самую релевантную).\n"
                "- Образование (университет, специальность, год окончания).\n"
                "- Навыки (ключевые hard skills).\n"
                "- Проекты (краткое описание, если указаны).\n"
                "- Дополнительные курсы и награды (сертификаты, достижения).\n"
                "- Языки (укажи уровень владения).\n"
                "- Желаемую зарплату (если указана, min/max). Определи валюту "
                "(например, USD, EUR, KZT, RUB). Если валюта не указана, попробуй понять по контексту."
                "Если указано 'от X KZT', то X — это min_salary, а max_salary = null."
                "Если указан диапазон 'X–Y KZT', используй X как min_salary, Y как max_salary.\n"
                "- Общий краткий вывод (summary).\n"
                "- Уровень кандидата (Junior / Middle / Senior) — если указано или можно определить по опыту.\n\n"
                "Вот текст резюме:\n{resume_text}\n"
                "Проанализируй его и верни данные в следующем формате JSON:\n"
                "{{\n"
                "  \"first_name\": \"Алихан\",\n"
                "  \"last_name\": \"Нурсеитов\",\n"
                "  \"email\": \"alihan.nur@example.com\",\n"
                "  \"phone\": \"+7 777 456-78-90\",\n"
                "  \"experience_time\": 9.0,\n"
                "  \"profession\": \"Software Engineer\",\n"
                "  \"education\": \"КазНУ, Информационные технологии, 2025\", \"Tomorrow School, Full-stack разработка, 2026\",\n"
                "  \"skills\": [\"Python\", \"Java\", \"SQL\"],\n"
                "  \"awards\": [\"Лучший разработчик 2022\"],\n"
                "  \"projects\": [\"Разработка ERP-системы\"],\n"
                "  \"courses\": [\"Курс по ML в Coursera\"],\n"
                "  \"languages\": {{\"Казахский\": \"C2\", \"Английский\": \"B2\"}},\n"
                "  \"summary\": \"Опытный разработчик с 9 годами опыта в backend-разработке.\",\n"
                "  \"grade\": \"Senior\",\n"
                "  \"min_salary\": 1000000.00,\n"
                "  \"max_salary\": 1200000.00,\n"
                "  \"currency\": \"USD\"\n"
                "}}\n"
            )
        )

        chain = prompt | self.llm | RunnableLambda(lambda x: x.content.strip() if hasattr(x, "content") else str(x).strip())

        try:
            response = await chain.ainvoke({"resume_text": resume_text})
            logging.info(f"[RESUME ANALYSIS] Response from Langchain: {response}")

            parsed_json = json.loads(response)

            required_keys = ["first_name", "last_name", "email", "phone"]
            missing_keys = [key for key in required_keys if key not in parsed_json]
            if missing_keys:
                logging.error(f"[RESUME ANALYSIS] Missing keys in response: {missing_keys}")
                raise ValueError(f"Response is missing keys: {missing_keys}")

            return parsed_json
        except json.JSONDecodeError as e:
            logging.error(f"[RESUME ANALYSIS] Invalid JSON response: {response}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error parsing resume JSON")
        except Exception as e:
            logging.error(f"[RESUME ANALYSIS ERROR] Error analyzing resume: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error processing resume with Langchain")

    async def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            logging.info("[RESUME TEXT EXTRACTION] Extracting text from pdf")
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = "\n".join([page.get_text("text") for page in doc])
            logging.info(f"[RESUME TEXT EXTRACTION] {len(text)} symbols were extracted")
            return text
        except Exception as e:
            logging.error(f"[RESUME TEXT EXTRACTION] Error extracting text from pdf: {e}", exc_info=True)
            raise

    async def get_exchange_rate(self, currency: str) -> float:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(BackendConfig.NATIONAL_BANK_API_URL, timeout=10.0)
                logging.info(f"[EXCHANGE RATE] Response from National Bank: {response.status_code}")

                if response.status_code == 200:
                    root = ET.fromstring(response.text)
                    for item in root.findall(".//item"):
                        title = item.find("title").text.strip()
                        description = item.find("description").text.strip()
                        if title == currency.upper():
                            rate = float(description.replace(",", "."))
                            logging.info(f"[EXCHANGE RATE] Exchange rate {currency} -> KZT: {rate}")
                            return rate

                logging.warning(f"[EXCHANGE RATE] Exchange rate {currency} not found")
                return None
        except Exception as e:
            logging.error(f"[EXCHANGE RATE ERROR] Error getting exchange rate: {e}", exc_info=True)
            return None

    async def convert_salary_to_kzt(self, min_salary: float, max_salary: float, currency: str) -> tuple[float, float]:
        try:
            logging.info(f"[SALARY CONVERSION] Converting {min_salary}-{max_salary} {currency} into KZT")

            if currency.upper() == "KZT":
                logging.info("[SALARY CONVERSION] Salary is already in KZT, no conversion required")
                return min_salary, max_salary

            exchange_rate = await self.get_exchange_rate(currency)
            if exchange_rate:
                min_salary_kzt = round(min_salary * exchange_rate, 2) if min_salary else None
                max_salary_kzt = round(max_salary * exchange_rate, 2) if max_salary else None
                logging.info(f"[SALARY CONVERSION] {min_salary}-{max_salary} {currency} -> {min_salary_kzt}-{max_salary_kzt} KZT (rate: {exchange_rate})")
                return min_salary_kzt, max_salary_kzt
            else:
                logging.warning(f"[SALARY CONVERSION] Failed to get the exchange rate {currency} -> KZT. Conversion not possible")
                return None, None
        except Exception as e:
            logging.error(f"[SALARY CONVERSION ERROR] Error converting salary: {e}", exc_info=True)
            return None, None

    async def save_resume_to_db(self, db: AsyncSession, resume_data: dict, resume_link: str, user_id: int):
        try:
            logging.info(f"[RESUME DB SAVE] Saving resume for user {user_id}")

            candidate_info = resume_data
            min_salary_kzt, max_salary_kzt = await self.convert_salary_to_kzt(
                candidate_info.get("min_salary"), candidate_info.get("max_salary"), candidate_info.get("currency") or "KZT"
            )

            resume_schema = ResumeCreate(
                user_id=user_id,
                first_name=candidate_info.get("first_name"),
                last_name=candidate_info.get("last_name"),
                email=candidate_info.get("email"),
                phone=candidate_info.get("phone"),
                experience_time=candidate_info.get("experience_time", 0),
                profession=candidate_info.get("profession"),
                education=candidate_info.get("education"),
                skills=candidate_info.get("skills"),
                languages=candidate_info.get("languages"),
                awards=candidate_info.get("awards"),
                projects=candidate_info.get("projects"),
                courses=candidate_info.get("courses"),
                summary=candidate_info.get("summary"),
                resume_link=resume_link,
                min_salary=min_salary_kzt,
                max_salary=max_salary_kzt,
                original_min_salary=candidate_info.get("min_salary"),
                original_max_salary=candidate_info.get("max_salary"),
                original_currency=candidate_info.get("currency"),
                grade=candidate_info.get("grade"),
                created_at=datetime.utcnow()
            )
            logging.info(f"[RESUME DB SAVE] Generated resume URL: {resume_link}")

            resume = await self.resume_database.create_resume(db, resume_schema)
            logging.info(f"[RESUME DB SAVE] Resume has been successfully saved to the database: {resume.id}")
            return resume
        except Exception as e:
            logging.error(f"[RESUME DB SAVE ERROR] Error saving to DB: {e}", exc_info=True)
            raise

    async def create_resume(self, file: UploadFile, user_id: int, db: AsyncSession):
        try:
            logging.info(f"[RESUME CREATION] Start processing resume for user {user_id}")
            file_bytes = await file.read()
            resume_link = await self.save_resume(file_bytes)
            resume_text = await self.extract_text_from_pdf(file_bytes)
            resume_data = await self.analyze_resume(resume_text)
            resume = await self.save_resume_to_db(db, resume_data, resume_link, user_id)
            logging.info(f"[RESUME CREATION] Resume for user {user_id} is successfully processed")
            return resume
        except Exception as e:
            logging.error(f"[RESUME CREATION ERROR] Error creating resume: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

    async def get_resume_by_id(self, db: AsyncSession, resume_id: int):
        logging.info(f"[RESUME] Fetching resume with ID {resume_id}")
        resume = await self.resume_database.get_resume_by_id(db, resume_id)
        return resume

    async def get_user_resumes(self, db: AsyncSession, user_id: int):
        logging.info(f"[RESUME] Fetching resumes for user with ID {user_id}")
        resumes = await self.resume_database.get_resumes_by_user_id(db, user_id)
        return resumes