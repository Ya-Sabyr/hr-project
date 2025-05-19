from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    password: str
   
class UserCreate(UserBase):
    pass

class UserInDBBase(UserBase):
    id: int

class UserResponse(BaseModel):
    id: int
    email: str
    
class UserProfile(BaseModel):
    email: EmailStr
    full_name: str
    
    
    class Config:
        orm_mode = True