from .service import UserService
from .crud import UserDatabase

def get_user_service():
    return UserService(
        user_database=UserDatabase()
    )