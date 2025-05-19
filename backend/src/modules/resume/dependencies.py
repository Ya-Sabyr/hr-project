from azure.storage.blob.aio import BlobServiceClient
from fastapi import Depends
from langchain_openai import AzureChatOpenAI
from src.core.config import BackendConfig
from src.modules.resume.crud import ResumeDatabase
from src.modules.resume.service import ResumeService
from src.modules.vacancy.crud import VacancyDatabase
from src.modules.vacancy.service import VacancyService

def get_llm():
    """
    Provides an instance of AzureChatOpenAI configured with environment variables.
    """
    return AzureChatOpenAI(
        azure_endpoint=BackendConfig.AZURE_OPENAI_ENDPOINT,
        openai_api_key=BackendConfig.AZURE_OPENAI_API_KEY,
        deployment_name=BackendConfig.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=BackendConfig.AZURE_OPENAI_API_VERSION,
        temperature=0.2  
    )

def get_blob_service_client():
    """
    Provides an instance of BlobServiceClient configured with environment variables.
    """
    return BlobServiceClient.from_connection_string(BackendConfig.AZURE_STORAGE_CONNECTION_STRING)

def get_resume_service(
    resume_database=ResumeDatabase,
    llm=Depends(get_llm),
    blob_service_client=Depends(get_blob_service_client)
):
    """
    Provides an instance of ResumeService configured with dependencies.
    """
    return ResumeService(
        resume_database=resume_database,
        llm=llm,
        blob_service_client=blob_service_client,
        container_name=BackendConfig.AZURE_STORAGE_CONTAINER_NAME
    )

def get_vacancy_service(llm=Depends(get_llm)):
    """
    Provides an instance of VacancyService configured with dependencies.
    """
    return VacancyService(
        vacancy_database=VacancyDatabase,
        llm=llm
    )