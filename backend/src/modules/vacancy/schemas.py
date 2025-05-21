from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from src.models import EmploymentTypeEnum, ExperienceTimeEnum, JobFormatEnum, VacancyStatusEnum

class VacancyBase(BaseModel):
    title: str
    position: str
    description: str
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    location: str
    employment_type: EmploymentTypeEnum
    experience_time: Optional[ExperienceTimeEnum] = None
    job_format: JobFormatEnum
    skills: Optional[str] = None
    telegram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None

    
class VacancyCreate(VacancyBase):
    pass

class VacancyUpdate(VacancyBase):
    title: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    employment_type: Optional[EmploymentTypeEnum] = None
    experience_time: Optional[ExperienceTimeEnum] = None
    job_format: Optional[JobFormatEnum] = None
    skills: Optional[str] = None
    telegram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None 

class VacancyStatusUpdate(BaseModel):
    status: VacancyStatusEnum

class VacancyPublic(BaseModel):
    id: int
    title: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    employment_type: Optional[EmploymentTypeEnum] = None
    experience_time: Optional[ExperienceTimeEnum] = None
    job_format: Optional[JobFormatEnum] = None
    skills: Optional[str] = None
    telegram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None 

class VacancyInDBBase(VacancyBase):
    id: int
    status: VacancyStatusEnum

    class Config:
        orm_mode = True