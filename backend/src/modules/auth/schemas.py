from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str | None = None

class Login(BaseModel):
    email: EmailStr
    password: str