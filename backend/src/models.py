from sqlalchemy import Column, Float, Integer, String, DECIMAL, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.core.database import Base
from datetime import datetime
from sqlalchemy import Enum as SAEnum
from enum import Enum
from sqlalchemy.dialects.postgresql import JSON

class EmploymentTypeEnum(str, Enum):
    full = "Full-time"
    part = "Part-time"
    internship = "Internship"

class JobFormatEnum(str, Enum):
    office = "Office"
    remote = "Remote"
    hybrid = "Hybrid"

class VacancyStatusEnum(str, Enum):
    under_review = "Under review"
    accepted = "Accepted"
    rejected = "Rejected"

class ExperienceTimeEnum(str, Enum):
    no_experience = "No experience"
    one_to_three_years = "1-3 years"
    three_to_five_years = "3-5 years"
    more_than_five_years = "More than 5 years"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    
    experience_time = Column(Float, nullable=True)
    profession = Column(String(255), nullable=True)
    
    languages = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)
    awards = Column(JSON, nullable=True)
    projects = Column(JSON, nullable=True)
    courses = Column(JSON, nullable=True)
    
    summary = Column(Text, nullable=True)
    grade = Column(String(50), nullable=True)  # Junior, Middle, Senior
    
   # Salary in Tenge
    min_salary = Column(Float, nullable=True)
    max_salary = Column(Float, nullable=True)

    # Original salary
    original_min_salary = Column(Float, nullable=True)
    original_max_salary = Column(Float, nullable=True)
    original_currency = Column(String, nullable=True)
    
    resume_link = Column(Text, nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    applications = relationship("Application", back_populates="resume", cascade="all, delete-orphan") 
    user = relationship("User", back_populates="resumes")

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    email = Column(String(80), nullable=False, unique=True)
    password = Column(String(80), nullable=False)
    full_name = Column(String(80), nullable=False)
    blocked = Column(Boolean, nullable=False, default=False)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
   
class HR(Base):
    __tablename__ = "hr"

    id = Column(Integer, primary_key=True)
    email = Column(String(80), nullable=False, unique=True)
    password = Column(String(80), nullable=False)
    full_name = Column(String(80), nullable=False)
    contact_info = Column(String(80), nullable=False)
    company = Column(String(80), nullable=False)
    blocked = Column(Boolean, nullable=False, default=False)
    approved = Column(Boolean, nullable=False, default=False)  # Admin approval status
    vacancies = relationship("Vacancy", back_populates="hr", cascade="all, delete-orphan") 

class Admin(Base):
    __tablename__ = "admin"

    id = Column(Integer, primary_key=True)
    email = Column(String(80), nullable=False, unique=True)
    password = Column(String(80), nullable=False)

class Vacancy(Base):
    __tablename__ = "vacancy"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False) # профессия
    position = Column(String(150), nullable=False) # грейд
    description = Column(Text, nullable=False)
    salary_min = Column(DECIMAL(10, 2))
    salary_max = Column(DECIMAL(10, 2))
    location = Column(String(80), nullable=False) 
    hr_id = Column(Integer, ForeignKey('hr.id'), nullable=False)
    company = Column(String(80), nullable=False)
    employment_type = Column(SAEnum(EmploymentTypeEnum), nullable=False, default=EmploymentTypeEnum.full)
    experience_time = Column(SAEnum(ExperienceTimeEnum), nullable=True, default=ExperienceTimeEnum.no_experience)
    job_format = Column(SAEnum(JobFormatEnum), nullable=False, default=JobFormatEnum.office)
    status = Column(SAEnum(VacancyStatusEnum), nullable=False, default=VacancyStatusEnum.under_review)

    skills = Column(Text)

    telegram = Column(String(80), nullable=True)  
    whatsapp = Column(String(80), nullable=True) 
    email = Column(String(150), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    hr = relationship("HR", back_populates="vacancies")
    applications = relationship("Application", back_populates="vacancy", cascade="all, delete-orphan")

class ApplicationStatusEnum(str, Enum):
    pending = "Pending"
    accepted = "Accepted"
    rejected = "Rejected"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    vacancy_id = Column(Integer, ForeignKey("vacancy.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    status = Column(SAEnum(ApplicationStatusEnum), nullable=False, default=ApplicationStatusEnum.pending)
    matching_score = Column(Integer, nullable=False, default=0)  
    resume_path = Column(String(255), nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    summary = Column(Text, nullable=True)
    user = relationship("User", back_populates="applications")
    vacancy = relationship("Vacancy", back_populates="applications")
    resume = relationship("Resume")
