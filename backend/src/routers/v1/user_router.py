from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.core.database import get_db
from backend.src.modules.application.dependencies import get_application_service
from backend.src.modules.resume.dependencies import get_resume_service
from backend.src.modules.vacancy.dependencies import get_vacancy_service
from src.core.dependencies import get_current_user, user_required
from src.modules.vacancy.schemas import VacancyPublic
from src.modules.vacancy.service import VacancyService
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from src.modules.resume.service import ResumeService
from src.modules.application.service import ApplicationService
from src.models import User
from src.modules.user.schemas import UserProfile
from src.modules.user.service import UserService
from src.modules.user.dependencies import get_user_service
import logging

router = APIRouter(prefix="/user", tags=["User"], dependencies=[Depends(user_required)])

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(user_required),
    user_service: UserService = Depends(get_user_service)
):
    logging.info(f"[USER PROFILE] Fetching profile for USER ID {user.id}")
    return await user_service.get_user_by_id(db, user.id)

@router.get("/accepted", response_model=List[VacancyPublic])
async def get_accepted_vacancies(
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service),
    user: User = Depends(user_required)
):
    logging.info("[VACANCY FETCH] Fetching vacancies under review")
    return await vacancy_service.get_accepted_vacancies_for_users(db)

@router.get("/accepted/{vacancy_id}", response_model=VacancyPublic)
async def get_accepted_vacancy_by_id(
    vacancy_id: int,
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service),
    user: User = Depends(user_required)
):
    logging.info(f"[VACANCY FETCH] Fetching accepted vacancy ID {vacancy_id}")
    return await vacancy_service.get_accepted_vacancy_by_id(db, vacancy_id)

@router.post("/")
async def upload_resume(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db), 
    user: User = Depends(user_required),
    resume_service: ResumeService = Depends(get_resume_service)
):
    logging.info(f"[RESUME UPLOAD] User uploading file: {file.filename}")
    
    if file.content_type != "application/pdf":
        logging.warning(f"[RESUME UPLOAD ERROR] User uploaded invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Только PDF-файлы поддерживаются")
    
    resume = await resume_service.create_resume(file, user.id, db)  
    logging.info(f"[RESUME UPLOAD SUCCESS] Resume ID {resume.id} uploaded by user")
    return {"message": "Резюме загружено", "resume_id": resume.id}

@router.get("/")
async def get_resumes(
    db: AsyncSession = Depends(get_db), 
    user: User = Depends(user_required),
    resume_service: ResumeService = Depends(get_resume_service)
):
    logging.info(f"[RESUME FETCH] Fetching resumes for USER ID {user.id}")
    return await resume_service.get_user_resumes(db, user.id)

@router.get("/{resume_id}")
async def get_resume(
    resume_id: int, 
    db: AsyncSession = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service),
    auth = Depends(get_current_user)
):
    logging.info(f"[RESUME FETCH] Fetching resume ID {resume_id}")
    return await resume_service.get_resume_by_id(db, resume_id)

@router.post("/applications/")
async def create_application(
    vacancy_id: int, 
    resume_id: int, 
    db: Session = Depends(get_db), 
    user: User = Depends(user_required),
    application_service: ApplicationService = Depends(get_application_service)
):
    logging.info(f"[APPLICATION CREATE] User applying to vacancy {vacancy_id} with resume {resume_id}")
    
    try:
        application = await application_service.create_application(db, user.id, vacancy_id, resume_id)
        logging.info(f"[APPLICATION SUCCESS] Application ID {application.id} created")
        return {"message": "Заявка создана", "application_id": application.id, "matching_score": application.matching_score}
    except ValueError as e:
        logging.warning(f"[APPLICATION ERROR] User failed to apply: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/applications/")
async def get_applications(
    user: User = Depends(user_required), 
    db: AsyncSession = Depends(get_db),
    application_service: ApplicationService = Depends(get_application_service)
):
    logging.info(f"[APPLICATION FETCH] Fetching applications for USER ID {user.id}")
    return await application_service.get_user_applications(db, user.id)

@router.get("/user/{user_id}/vacancies", response_model=List[int])
async def get_applied_vacancies(
    user: User = Depends(user_required), 
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service),    
):
    logging.info(f"[APPLICATION VACANCIES] Fetching applied vacancy IDs for USER ID {user.id}")
    return await vacancy_service.get_applied_vacancies(db, user.id)

@router.get("/user/{user_id}/vacancies/details", response_model=List[VacancyPublic])
async def get_applied_vacancy_details(
    user: User = Depends(user_required), 
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service),
):
    logging.info(f"[APPLICATION VACANCY DETAILS] Fetching applied vacancy details for USER ID {user.id}")
    return await vacancy_service.get_applied_vacancy_details(db, user.id)
