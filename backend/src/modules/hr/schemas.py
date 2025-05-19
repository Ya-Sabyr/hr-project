from pydantic import BaseModel, EmailStr
from typing import Optional

class HRBase(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    contact_info: str
    company: str

class HRCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    contact_info: str
    company: str

class HRUpdate(BaseModel):
    full_name: Optional[str] = None
    contact_info: Optional[str] = None
    company: Optional[str] = None

class HRProfile(BaseModel):
    email: EmailStr
    full_name: str
    contact_info: str
    company: str

class HRInDB(HRBase):
    id: int

    class Config:
        orm_mode = True
