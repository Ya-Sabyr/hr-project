import os

from dotenv import load_dotenv

load_dotenv()

class AuthSettings():
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES = 1440 * 7  # 7 day    

auth_settings = AuthSettings()