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
    return BlobServiceClient.from_connection_string(BackendConfig.AZURE_STORAGE_CONNECTION_STRING)

def get_resume_service(
    llm=Depends(get_llm),
    blob_service_client=Depends(get_blob_service_client)
):
    return ResumeService(
        resume_database=ResumeDatabase(),
        llm=llm,
        blob_service_client=blob_service_client,
        container_name=BackendConfig.AZURE_STORAGE_CONTAINER_NAME
    )