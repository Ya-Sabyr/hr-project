from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from fastapi import APIRouter, Depends
from backend.src.core.database import get_db
from backend.src.modules.admin.dependencies import get_admin_user_service, get_admin_hr_service, get_admin_service
from backend.src.modules.vacancy.dependencies import get_vacancy_service
from src.core.dependencies import admin_required
from src.modules.admin.services.hr_admin_service import HRAdminService
from src.modules.admin.services.user_admin_service import UserAdminService
from src.modules.admin.schemas import HRInDBAdmin, UserInDBAdmin
from src.modules.vacancy.service import VacancyService
from src.modules.vacancy.schemas import VacancyInDBBase, VacancyStatusUpdate

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(admin_required)])

# USER ROUTES
@router.get("/users", response_model=list[UserInDBAdmin])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    user_admin_service: UserAdminService = Depends(get_admin_user_service)
):
    logging.info("[USER FETCH] Fetching all users")
    return await user_admin_service.get_all_users(db)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    user_admin_service: UserAdminService = Depends(get_admin_user_service)
):
    logging.info(f"[USER DELETE] Deleting user with ID: {user_id}")
    await user_admin_service.delete_user(db, user_id)
    logging.info(f"✅ [USER DELETED] User with ID {user_id} deleted successfully")
    return {"message": "User deleted successfully"}

@router.put("/toggle-block/user/{user_id}")
async def toggle_block_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    user_admin_service: UserAdminService = Depends(get_admin_user_service)
):
    logging.info(f"[USER BLOCK TOGGLE] Toggling block status for user with ID: {user_id}")
    return await user_admin_service.toggle_user_block_status(db, user_id)

# HR ROUTES
@router.get("/hrs", response_model=list[HRInDBAdmin])
async def get_all_hrs(
    db: AsyncSession = Depends(get_db),
    hr_admin_service: HRAdminService = Depends(get_admin_hr_service)
):
    logging.info("[HR FETCH] Fetching all HRs")
    return await hr_admin_service.get_all_hrs(db)

@router.get("/hrs/pending", response_model=list[HRInDBAdmin])
async def get_pending_hrs(
    db: AsyncSession = Depends(get_db),
    hr_admin_service: HRAdminService = Depends(get_admin_hr_service)
):
    logging.info("[HR FETCH] Fetching pending HRs")
    return await hr_admin_service.get_pending_hrs(db)

@router.delete("/hrs/{hr_id}")
async def delete_hr(
    hr_id: int, 
    db: AsyncSession = Depends(get_db),
    hr_admin_service: HRAdminService = Depends(get_admin_hr_service)
):
    logging.info(f"[HR DELETE] Deleting HR with ID: {hr_id}")
    await hr_admin_service.delete_hr(db, hr_id)
    logging.info(f"✅ [HR DELETED] HR with ID {hr_id} deleted successfully")
    return {"message": "HR deleted successfully"}

@router.put("/approve/hr/{hr_id}")
async def approve_hr(
    hr_id: int, 
    db: AsyncSession = Depends(get_db),
    hr_admin_service: HRAdminService = Depends(get_admin_hr_service)
):
    logging.info(f"[HR APPROVE] Approving HR with ID: {hr_id}")
    return await hr_admin_service.approve_hr(db, hr_id)

@router.put("/toggle-block/hr/{hr_id}")
async def toggle_block_hr(
    hr_id: int,
    db: AsyncSession = Depends(get_db),
    hr_admin_service: HRAdminService = Depends(get_admin_hr_service)
):
    logging.info(f"[HR BLOCK TOGGLE] Toggling block status for HR with ID: {hr_id}")
    return await hr_admin_service.toggle_hr_block_status(db, hr_id)


@router.patch("/{vacancy_id}/status", response_model=VacancyInDBBase)
async def change_vacancy_status(
    vacancy_id: int,
    status_data: VacancyStatusUpdate, 
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info(f"[VACANCY STATUS UPDATE] Attempting to update vacancy ID {vacancy_id} to {status_data.status}")
    vacancy = await vacancy_service.update_vacancy_status(db, vacancy_id, status_data)

    logging.info(f"✅ [VACANCY STATUS UPDATED] Vacancy ID {vacancy_id} successfully updated to {vacancy.status}")
    return vacancy

@router.get("/vacancies/review", response_model=List[VacancyInDBBase])
async def get_vacancies_under_review(
    db: AsyncSession = Depends(get_db),
    vacancy_service: VacancyService = Depends(get_vacancy_service)
):
    logging.info("[VACANCY FETCH] Fetching vacancies under review")
    return await vacancy_service.get_vacancies_under_review(db),