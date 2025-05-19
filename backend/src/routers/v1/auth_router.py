from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from backend.src.modules.auth.dependencies import get_auth_service

from src.modules.auth.service import AuthService
from src.modules.auth.schemas import Login, Token
from backend.src.core.database import get_db
from src.modules.user.schemas import UserCreate
from src.modules.hr.schemas import HRCreate
from src.modules.hr.service import HRService
from src.modules.hr.dependencies import get_hr_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(
    obj_in: Login,
    db: AsyncSession = Depends(get_db), 
    hr_service: HRService = Depends(get_hr_service),
    auth: AuthService = Depends(get_auth_service)
    ):
    logging.info(f"[AUTH LOGIN] Attempting login for user: {obj_in.email}")
    
    access_token, refresh_token, user_type, user_id = await auth.authenticate_user(obj_in.email, obj_in.password, db)

    if user_type == "hr":
        hr = await hr_service.get_hr_by_id(db, user_id)
        if not hr.approved:
            logging.warning(f"❗ [HR NOT APPROVED] HR {obj_in.email} is not approved yet")
            raise HTTPException(status_code=403, detail="Your account is awaiting admin approval.")
    
    logging.info(f"✅ [AUTH SUCCESS] User {obj_in.email} authenticated as {user_type}")
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "refresh_token": refresh_token,
        "user_type": user_type,
        "user_id": user_id
    }

@router.post(
        "/register/user",
        response_model=Token
)
async def register_user(
    obj_in: UserCreate, 
    db: AsyncSession = Depends(get_db),
    auth: AuthService = Depends(get_auth_service)
):
    logging.info(f"[USER REGISTRATION] Registering new user: {obj_in.email}")
    access_token, refresh_token = await auth.register_user(obj_in, db)
    logging.info(f"✅ [USER REGISTERED] User {obj_in.email} registered successfully")
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/register/hr")
async def register_hr(
    obj_in: HRCreate, 
    db: AsyncSession = Depends(get_db),
    auth: AuthService = Depends(get_auth_service)
):
    logging.info(f"[HR REGISTRATION] Registering new HR: {obj_in.email}")
    await auth.register_hr(obj_in, db)  # Register HR without issuing a token
    logging.info(f"✅ [HR REGISTRATION REQUEST] HR registration request for {obj_in.email} submitted. Awaiting admin approval.")
    return {"message": "HR registration request submitted. Wait for admin approval."}

@router.post("/refresh", response_model=Token)
async def refresh_token_route(
    request: Request, 
    auth: AuthService = Depends(get_auth_service)
):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    try:
        refresh_token = auth_header.split(" ")[1]
    except (IndexError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid Authorization Header")
    logging.info(f"[AUTH REFRESH] Refreshing token using provided refresh token")
    access_token, refresh_token = await auth.verify_refresh_token(refresh_token)
    logging.info(f"✅ [AUTH REFRESH SUCCESS] Token refreshed successfully")
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}