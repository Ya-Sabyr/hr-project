from langchain_openai import AzureChatOpenAI
from src.core.config import BackendConfig
from src.modules.resume.dependencies import get_resume_service
from src.modules.vacancy.dependencies import get_vacancy_service
from src.modules.application.crud import ApplicationDatabase
from src.modules.application.service import ApplicationService
from fastapi import Depends

def get_llm():
    """
    Provides an instance of AzureChatOpenAI configured with environment variables.
    """
    return AzureChatOpenAI(
        azure_endpoint=BackendConfig.AZURE_OPENAI_ENDPOINT,
        openai_api_key=BackendConfig.AZURE_OPENAI_API_KEY,
        deployment_name=BackendConfig.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=BackendConfig.AZURE_OPENAI_API_VERSION,
        temperature=0.4  # Match the temperature used in ApplicationService
    )

def get_application_service(
    application_database=ApplicationDatabase,
    vacancy_service=Depends(get_vacancy_service),
    resume_service=Depends(get_resume_service),
    llm=Depends(get_llm)
):
    """
    Provides an instance of ApplicationService configured with dependencies.
    """
    return ApplicationService(
        application_database=application_database,
        vacancy_service=vacancy_service,
        resume_service=resume_service,
        llm=llm
    )