import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.core.database import get_db
from backend.src.modules.auth.service import AuthService
from src.modules.hr.dependencies import get_hr_service
from src.modules.hr.service import HRService
from src.core.dependencies import get_current_user, hr_required
from src.modules.hr.schemas import HRInDB, HRUpdate, HRProfile
from src.models import HR
from src.modules.vacancy.dependencies import get_vacancy_service
from src.modules.vacancy.service import VacancyService
from src.modules.vacancy.schemas import VacancyCreate, VacancyUpdate, VacancyInDBBase
from src.modules.application.service import ApplicationService
from src.modules.application.dependencies import get_application_service
from src.modules.application.schemas import CandidateResponseSchema


router = APIRouter(prefix="/hr", tags=["HR"], dependencies=[Depends(hr_required)])

@router.get("/me", response_model=HRProfile)
async def get_hr_profile(
    db: AsyncSession = Depends(get_db),
    hr: HR = Depends(hr_required),
    hr_service: HRService = Depends(get_hr_service)
):
    logging.info(f"[HR PROFILE] Fetching profile for HR ID {hr.id}")
    return await hr_service.get_hr_by_id(db, hr.id)


@router.put("/me", response_model=HRInDB)
async def update_hr(
    hr_update: HRUpdate,
    db: AsyncSession = Depends(get_db),
    hr: HR = Depends(hr_required),
    hr_service: HRService = Depends(get_hr_service)
):
    logging.info(f"[HR UPDATE] Updating HR ID {hr.id}")

    updated_hr = await hr_service.update_hr(db, hr.id, hr_update)
    return updated_hr

@router.delete("/me")
async def delete_hr(
    db: AsyncSession = Depends(get_db),
    hr: HR = Depends(hr_required),
    hr_service: HRService = Depends(get_hr_service)
):
    logging.info(f"[HR DELETE] Deleting HR ID {hr.id}")

    await hr_service.delete_hr(db, hr.id)
    return {"message": "HR account deleted successfully"}


@router.get("/{vacancy_id}", response_model=VacancyInDBBase)
async def get_vacancy(
    vacancy_id: int,
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service),
    auth: AuthService = Depends(get_current_user)
):
    logging.info(f"[VACANCY FETCH] Fetching vacancy ID {vacancy_id}")
    vacancy = await vacancy_service.get_vacancy_by_id(db, vacancy_id)
    return vacancy

@router.post("/classify")
async def classify_vacancy(
    description: str,
    auth: AuthService = Depends(get_current_user),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info("[VACANCY CLASSICATION]Request received for vacancy classification.")
    try:
        suggested_professions = await vacancy_service.classify_vacancy_with_ai(description)
        logging.info(f"[VACANCY CLASSIFICATION] Successfully classified the vacancy")
        return {"professions": suggested_professions}
    except ValueError as e:
        logging.error(f"[VACANCY CLASSIFICATION ERROR] Error during classification: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/", response_model=VacancyInDBBase)
async def create_vacancy(
    vacancy: VacancyCreate,
    hr: HR = Depends(hr_required),
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[VACANCY CREATE] HR {hr.id} creates vacancy")
    new_vacancy = await vacancy_service.create_vacancy(db, vacancy, hr)
    return new_vacancy

@router.get("/", response_model=List[VacancyInDBBase])
async def get_hr_vacancies(
    db: AsyncSession = Depends(get_db), 
    hr: HR = Depends(hr_required),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[VACANCY FETCH] Fetching vacancies for HR ID {hr.id}")
    return await vacancy_service.get_vacancies_by_hr(db, hr)

@router.put("/{vacancy_id}", response_model=VacancyInDBBase)
async def update_vacancy(
    vacancy_id: int,
    vacancy: VacancyUpdate,
    hr: HR = Depends(hr_required),
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[VACANCY UPDATE] HR {hr.id} updates vacancy {vacancy_id}")
    existing_vacancy = await vacancy_service.get_vacancy_by_id(db, vacancy_id)

    if existing_vacancy.hr_id != hr.id:
        logging.warning(f"[VACANCY UPDATE] HR {hr.id} tried to update vacancy not belonging to them")
        raise HTTPException(status_code=403, detail="You cannot update someone else's vacancy")

    return await vacancy_service.update_vacancy(db, vacancy_id, vacancy)


@router.delete("/{vacancy_id}")
async def delete_vacancy(
    vacancy_id: int,
    hr: HR = Depends(hr_required),
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[VACANCY DELETE] HR {hr.id} deletes vacancy {vacancy_id}")
    existing_vacancy = await vacancy_service.get_vacancy_by_id(db, vacancy_id)

    if existing_vacancy.hr_id != hr.id:
        raise HTTPException(status_code=403, detail="You cannot delete someone else's vacancy")

    await vacancy_service.delete_vacancy(db, vacancy_id)
    return {"message": "Vacancy deleted successfully"}

@router.get("/vacancy/{vacancy_id}", response_model=List[CandidateResponseSchema])
async def get_candidates(
    vacancy_id: int, 
    db: AsyncSession = Depends(get_db), 
    hr: HR = Depends(hr_required),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[CANDIDATES FETCH] HR {hr.id} fetches candidates for vacancy {vacancy_id}")
    return await vacancy_service.fetch_candidates_by_vacancy(db, vacancy_id)

@router.post("/applications/{application_id}/accept")
async def accept_candidate(
    application_id: int,
    hr: HR = Depends(hr_required),
    db: AsyncSession = Depends(get_db),
    application_service: ApplicationService = Depends(get_application_service)
):
    logging.info(f"[CANDIDATE ACCEPT] HR {hr.id} accepts candidate {application_id}")
    return await application_service.accept_candidate(db, application_id)


@router.post("/applications/{application_id}/reject")
async def reject_candidate(
    application_id: int,
    hr: HR = Depends(hr_required),
    db: AsyncSession = Depends(get_db),
    application_service: ApplicationService = Depends(get_application_service)
):
    logging.info(f"[CANDIDATE REJECT] HR {hr.id} rejects candidate {application_id}")
    return await application_service.reject_candidate(db, application_id)
