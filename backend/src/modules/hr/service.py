import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import Optional
from passlib.context import CryptContext

from .crud import HRDatabase
from .schemas import HRUpdate, HRCreate, HRProfile
from src.models import HR

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class HRService:

    def __init__(self, hr_database: HRDatabase):
        self.hr_database = hr_database

    async def create_hr(self, db: AsyncSession, obj_in: HRCreate) -> HR:
        logging.info(f"[HR CREATE] Attempting to create HR with email: {obj_in.email}")

        existing_hr = await self.hr_database.get_hr_by_email(db, obj_in.email)
        if existing_hr:
            logging.warning(f"❗ [HR CREATE] Failed: HR with email {obj_in.email} already exists")
            raise HTTPException(status_code=400, detail="HR with this email already exists")

        hashed_password = pwd_context.hash(obj_in.password)

        hr = HR(
            email=obj_in.email,
            password=hashed_password,
            full_name=obj_in.full_name,
            contact_info=obj_in.contact_info,
            company=obj_in.company,
            approved=False
        )

        created_hr = await self.hr_database.create_hr(db, hr)

        logging.info(f"✅ [HR CREATED] HR {created_hr.id} successfully created with email: {created_hr.email}")
        return created_hr
    
    async def get_hr_by_id(self, db: AsyncSession, hr_id: int) -> HR:
        logging.info(f"[HR FETCH] Fetching HR with ID: {hr_id}")

        hr = await self.hr_database.get_hr_by_id(db, hr_id)
        if not hr:
            logging.warning(f"❗ [HR FETCH] HR with ID {hr_id} not found")
            raise HTTPException(status_code=404, detail="HR not found")

        logging.info(f"✅ [HR FETCH] HR {hr.id} retrieved successfully")
        return hr
    
    async def get_hr_profile(self, db: AsyncSession, hr_id: int) -> HR:
        logging.info(f"[HR PROFILE] Attempting to get HR profile with ID: {hr_id}")
        hr = await self.hr_database.get_hr_by_id(db, hr_id)
        if not hr:
            raise HTTPException(status_code=404, detail="HR not found")
        
        return HRProfile(
            email=hr.email,
            full_name=hr.full_name,
            contact_info=hr.contact_info,
            company=hr.company
        )
       
    async def update_hr(self, db: AsyncSession, hr_id: int, obj_in: HRUpdate) -> HR:
        logging.info(f"[HR UPDATE] Attempting to update HR with ID: {hr_id}")

        hr = await self.hr_database.get_hr_by_id(db, hr_id)
        if not hr:
            logging.warning(f"❗ [HR UPDATE] HR with ID {hr_id} not found")
            raise HTTPException(status_code=404, detail="HR not found")

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(hr, field, value)

        await db.commit()
        await db.refresh(hr)

        logging.info(f"✅ [HR UPDATED] HR {hr.id} updated successfully")
        return hr

    async def get_hr_by_email(self, db: AsyncSession, email: str) -> Optional[HR]:
        logging.info(f"[HR FETCH] Fetching HR with email: {email}")
        return await self.hr_database.get_hr_by_email(db, email)

    async def delete_hr(self, db: AsyncSession, hr_id: int) -> None:
        logging.info(f"[HR DELETE] Attempting to delete HR with ID: {hr_id}")

        hr = await self.hr_database.get_hr_by_id(db, hr_id)
        if not hr:
            logging.warning(f"❗ [HR DELETE] HR with ID {hr_id} not found")
            raise HTTPException(status_code=404, detail="HR not found")

        await db.delete(hr)
        await db.commit()

        logging.info(f"✅ [HR DELETED] HR {hr_id} deleted successfully")

