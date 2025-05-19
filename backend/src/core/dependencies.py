import logging
import jwt
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.modules.auth.dependencies import get_auth_service
from backend.src.modules.auth.service import AuthService

from .config import BackendConfig
from backend.src.core.database import get_db
from src.modules.user.dependencies import get_user_service
from src.modules.user.service import UserService
from src.modules.hr.service import HRService
from src.modules.hr.dependencies import get_hr_service
from src.modules.admin.services.admin_service import AdminService
from src.modules.admin.dependencies import get_admin_service
from src.models import Admin, HR, User

async def get_current_user(
        token: str, 
        db: AsyncSession = Depends(get_db),
        auth_service: AuthService = Depends(get_auth_service),
        user_service: UserService = Depends(get_user_service),
        hr_service: HRService = Depends(get_hr_service),
        admin_service: AdminService = Depends(get_admin_service)
):
    try:
        payload = await auth_service.jwt_manager.decode_jwt(token)
        user_id = payload.get("id")
        user_type = payload.get("type")

        if user_type == "user":
            user = await user_service.get_user_by_id(db, user_id)
        elif user_type == "hr":
            user = await hr_service.get_hr_by_id(db, user_id)
        elif user_type == "admin":
            user = await admin_service.get_admin_by_id(db, user_id)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user type")

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if getattr(user, "blocked", False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is blocked")

        return user

    except (jwt.PyJWTError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

async def admin_required(user=Depends(get_current_user)):
    if not isinstance(user, Admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

async def hr_required(user=Depends(get_current_user)):
    if not isinstance(user, HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")
    return user

async def user_required(user=Depends(get_current_user)):
    if not isinstance(user, User):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User access required")
    return user

def get_backend_config() -> BackendConfig:
    return BackendConfig()