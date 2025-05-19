from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Union
from datetime import datetime

class ResumeCreate(BaseModel):
    user_id: int
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    experience_time: Optional[float] = 0
    profession: Optional[str]
    education: Optional[Union[str, List[str]]]
    skills: Optional[List[str]]
    languages: Optional[Dict[str, str]]
    awards: Optional[List[str]]
    projects: Optional[List[str]]
    courses: Optional[List[str]]
    summary: Optional[str]
    min_salary: Optional[float]
    max_salary: Optional[float]
    original_min_salary: Optional[float]
    original_max_salary: Optional[float]
    original_currency: Optional[str]
    grade: Optional[str]
    resume_link: Optional[str]

class ResumeResponse(ResumeCreate):
    id: int
    resume_link: str
    created_at: datetime

    class Config:
        from_attributes = True  
