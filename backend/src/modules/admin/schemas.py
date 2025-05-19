from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    blocked: bool

class HRBase(UserBase):
    contact_info: str
    company: str
    approved: bool

class UserInDBAdmin(UserBase):
    id: int
    blocked: bool

    class Config:
        orm_mode = True

class HRInDBAdmin(HRBase):
    id: int
    blocked: bool
    approved: bool

    class Config:
        orm_mode = True
