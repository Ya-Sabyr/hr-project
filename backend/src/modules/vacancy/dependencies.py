from fastapi import Depends
from langchain_openai import AzureChatOpenAI
from src.core.config import BackendConfig
from .crud import VacancyDatabase  
from .service import VacancyService

def get_llm():
    """
    Provides an instance of AzureChatOpenAI configured with environment variables.
    """
    return AzureChatOpenAI(
        azure_endpoint=BackendConfig.AZURE_OPENAI_ENDPOINT,
        openai_api_key=BackendConfig.AZURE_OPENAI_API_KEY,
        deployment_name=BackendConfig.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=BackendConfig.AZURE_OPENAI_API_VERSION,
        temperature=0.4
    )

def get_vacancy_service(llm=Depends(get_llm)):
    """
    Provides an instance of VacancyService configured with a VacancyDatabase and LLM.
    """
    return VacancyService(
        vacancy_database=VacancyDatabase,  # Fixed typo
        llm=llm
    )