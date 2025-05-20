from passlib.context import CryptContext

class PasswordManager:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    async def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    async def verify_password(self, password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(password, hashed_password)