import logging
import os
import sys

from dotenv import load_dotenv
from logtail import LogtailHandler

load_dotenv()

class BackendConfig:
    # Azure OpenAI config
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    
    # Azure Blob Storage
    AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
    AZURE_STORAGE_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "resumes")

    # Allowed hosts
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "http://localhost:5173,http://127.0.0.1").split(",")

    # Debug and logging
    DEBUG: bool = os.getenv("DEBUG_MODE", "False").upper() == "TRUE"
    LOGTAIL_SOURCE_TOKEN: str = os.getenv("LOGTAIL_SOURCE_TOKEN", "")

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

    #Bank for exchange rate
    NATIONAL_BANK_API_URL = os.getenv("NATIONAL_BANK_API_URL", "") 
    
    def configure_logging(self):
        if self.LOGTAIL_SOURCE_TOKEN:
            handler = LogtailHandler(source_token=self.LOGTAIL_SOURCE_TOKEN)
            logger = logging.getLogger()  # Get the root logger to apply globally
            logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

            logger.setLevel(logging.DEBUG if self.DEBUG else logging.INFO)
            logger.handlers = []  # Clear existing handlers
            logger.addHandler(handler)
            logger.addHandler(logging.StreamHandler(sys.stdout))
            
        logging.basicConfig(level=logging.DEBUG if self.DEBUG else logging.INFO)

backend_config = BackendConfig()