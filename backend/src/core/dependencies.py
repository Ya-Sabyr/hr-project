from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from src.modules.auth.constants import reuseable_oauth
from src.core.database import get_db
from src.modules.auth.dependencies import (
    get_auth_service,
    get_user_service,
    get_hr_service,
    get_admin_service,
)
from src.models import User, HR, Admin
from src.modules.auth.service import AuthService


async def get_current_user(
    token: str = Depends(reuseable_oauth),
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    user_service=Depends(get_user_service),
    hr_service=Depends(get_hr_service),
    admin_service=Depends(get_admin_service),
) -> User | HR | Admin:
    """
    Retrieve the current authenticated user (User, HR, or Admin) based on JWT token.
    """
    try:
        payload = await auth_service.jwt_manager.decode_jwt(token)
        user_id = payload.get("id")
        user_type = payload.get("type")

        if not user_id or not user_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        if user_type == "user":
            user = await user_service.get_user_by_id(db, user_id)
        elif user_type == "hr":
            user = await hr_service.get_hr_by_id(db, user_id)
        elif user_type == "admin":
            user = await admin_service.get_admin_by_id(db, user_id)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user type")

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if getattr(user, "blocked", False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is blocked")

        return user

    except Exception as e:
        logging.error(f"Token validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


async def admin_required(current_user: Admin | HR | User = Depends(get_current_user)) -> Admin:
    """
    Ensure the user has admin privileges.
    """
    if not isinstance(current_user, Admin):
        logging.error(f"Access denied for non-admin user: {getattr(current_user, 'email', 'unknown')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def hr_required(current_user: Admin | HR | User = Depends(get_current_user)) -> HR:
    """
    Ensure the user has HR privileges.
    """
    if not isinstance(current_user, HR):
        logging.error(f"Access denied for non-HR user: {getattr(current_user, 'email', 'unknown')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required"
        )
    return current_user


async def user_required(current_user: Admin | HR | User = Depends(get_current_user)) -> User:
    """
    Ensure the user has User privileges.
    """
    if not isinstance(current_user, User):
        logging.error(f"Access denied for non-User: {getattr(current_user, 'email', 'unknown')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User access required"
        )
    return current_user
