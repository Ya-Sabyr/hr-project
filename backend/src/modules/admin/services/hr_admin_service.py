from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import List
import logging

from src.modules.admin.crud import AdminHRDatabase
from src.models import HR

class HRAdminService:
    def __init__(self, hr_admin_db: AdminHRDatabase):
        self.hr_admin_db = hr_admin_db

    async def get_all_hrs(self, db: AsyncSession) -> List[HR]:
        logging.info("[HR FETCH] Fetching all HRs")
        return await self.hr_admin_db.get_all_hrs(db)

    async def get_pending_hrs(self, db: AsyncSession) -> List[HR]:
        logging.info("[HR FETCH] Fetching pending HRs")
        return await self.hr_admin_db.get_pending_hrs(db)

    async def get_hr_by_id(self, db: AsyncSession, hr_id: int) -> HR:
        logging.info(f"[HR FETCH] Fetching HR by ID: {hr_id}")
        hr = await self.hr_admin_db.get_hr_by_id(db, hr_id)
        if not hr:
            logging.warning(f"❗ [HR NOT FOUND] HR with ID {hr_id} not found")
            raise HTTPException(status_code=404, detail="HR not found")
        logging.info(f"✅ [HR FOUND] HR with ID {hr_id} retrieved successfully")
        return hr

    async def delete_hr(self, db: AsyncSession, hr_id: int):
        logging.info(f"[HR DELETE] Deleting HR by ID: {hr_id}")
        hr = await self.get_hr_by_id(db, hr_id)
        await self.hr_admin_db.delete_hr(db, hr)
        logging.info(f"✅ [HR DELETED] HR {hr.email} deleted successfully")

    async def approve_hr(self, db: AsyncSession, hr_id: int):
        logging.info(f"[HR APPROVE] Approving HR with ID: {hr_id}")
        hr = await self.get_hr_by_id(db, hr_id)
        if hr.approved:
            logging.warning(f"⚠️ [HR ALREADY APPROVED] HR {hr.email} is already approved")
            raise HTTPException(status_code=400, detail="HR is already approved")
        await self.hr_admin_db.approve_hr(db, hr)
        logging.info(f"✅ [HR APPROVED] HR {hr.email} has been approved")
        return {"message": f"HR {hr.email} has been approved"}

    async def toggle_hr_block_status(self, db: AsyncSession, hr_id: int):
        logging.info(f"[HR BLOCK TOGGLE] Toggling block status for HR ID: {hr_id}")
        hr = await self.get_hr_by_id(db, hr_id)
        updated_hr = await self.hr_admin_db.toggle_hr_block_status(db, hr)
        status = "blocked" if updated_hr.blocked else "unblocked"
        logging.info(f"✅ [HR STATUS TOGGLED] HR {updated_hr.email} has been {status}")
        return {"message": f"HR {updated_hr.email} has been {status}"}

