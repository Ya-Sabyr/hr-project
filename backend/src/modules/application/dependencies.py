from langchain_openai import AzureChatOpenAI
from src.core.config import BackendConfig
from src.modules.resume.dependencies import get_resume_service
from src.modules.vacancy.dependencies import get_vacancy_service
from src.modules.application.crud import ApplicationDatabase
from src.modules.application.service import ApplicationService
from fastapi import Depends

def get_llm():
    return AzureChatOpenAI(
        azure_endpoint=BackendConfig.AZURE_OPENAI_ENDPOINT,
        openai_api_key=BackendConfig.AZURE_OPENAI_API_KEY,
        deployment_name=BackendConfig.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=BackendConfig.AZURE_OPENAI_API_VERSION,
        temperature=0.4  
    )

def get_application_service(
    llm=Depends(get_llm)
):
    return ApplicationService(
        application_database=ApplicationDatabase(),
        vacancy_service=get_vacancy_service(),
        resume_service=get_resume_service(),
        llm=llm
    )