import logging
import jwt
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.user.service import UserService
from src.modules.hr.service import HRService
from src.modules.admin.services.admin_service import AdminService
from .utils.jwt_service import JWTManager
from .utils.password_manager import PasswordManager
from src.modules.user.schemas import UserCreate
from src.modules.hr.schemas import HRCreate

class AuthService:
    def __init__(
        self,
        user_service: UserService,
        hr_service: HRService,
        admin_service: AdminService,
        password_manager: PasswordManager,
        jwt_manager: JWTManager,
    ):
        self.user_service = user_service
        self.hr_service = hr_service
        self.admin_service = admin_service
        self.password_manager = password_manager
        self.jwt_manager = jwt_manager

    
    async def register_user(self, user_create: UserCreate, db: AsyncSession) -> tuple[str, str]:
        logging.info(f"[USER REGISTRATION] Registering user: {user_create.email}")
        
        user = await self.user_service.create_user(db, user_create)
        access_token = await self.jwt_manager.create_access_token({"id": user.id, "type": "user"})
        refresh_token = await self.jwt_manager.create_refresh_token({"id": user.id, "type": "user"})

        logging.info(f"✅ [USER REGISTRATION SUCCESS] User {user.email} successfully registered with ID {user.id}")
        return access_token, refresh_token


    async def register_hr(self, hr_create: HRCreate, db: AsyncSession) -> dict:
        logging.info(f"[HR REGISTRATION] Registering HR: {hr_create.email}")
        
        hr = await self.hr_service.create_hr(db, hr_create)

        logging.info(f"✅ [HR REGISTRATION REQUEST] HR registration request submitted for {hr_create.email}, awaiting admin approval.")
        return {"detail": "HR registration request submitted. Waiting for admin approval."}


    async def authenticate_user(self, email: str, password: str, db: AsyncSession):
        logging.info(f"[USER AUTHENTICATION] Authenticating user: {email}")

        # Check for user
        user = await self.user_service.get_user_by_email(db, email)
        if user and await self.password_manager.verify_password(password, user.password):
            if user.blocked:
                logging.warning(f"❗ [BLOCKED USER] Blocked user {email} attempted to log in")
                raise HTTPException(status_code=403, detail="User account is blocked")

            access_token, refresh_token = await AuthService._generate_tokens(user.id, "user")
            logging.info(f"✅ [USER AUTHENTICATION SUCCESS] User {email} authenticated successfully")
            return access_token, refresh_token, "user", user.id

        # Check for HR
        hr = await self.hr_service.get_hr_by_email(db, email)
        if hr and await self.password_manager.verify_password(password, hr.password):
            if not hr.approved:
                logging.warning(f"❗ [UNAPPROVED HR] HR {email} is not approved yet")
                raise HTTPException(status_code=403, detail="HR registration is pending approval")

            if hr.blocked:
                logging.warning(f"❗ [BLOCKED HR] Blocked HR {email} attempted to log in")
                raise HTTPException(status_code=403, detail="HR account is blocked")

            access_token, refresh_token = await AuthService._generate_tokens(hr.id, "hr")
            logging.info(f"✅ [HR AUTHENTICATION SUCCESS] HR {email} authenticated successfully")
            return access_token, refresh_token, "hr", hr.id

        # Check for admin
        admin = await self.admin_service.get_admin_by_email(db, email)
        if admin and await self.password_manager.verify_password(password, admin.password):
            access_token, refresh_token = await AuthService._generate_tokens(admin.id, "admin")
            logging.info(f"✅ [ADMIN AUTHENTICATION SUCCESS] Admin {email} authenticated successfully")
            return access_token, refresh_token, "admin", admin.id

        logging.warning(f"❗ [FAILED LOGIN] Failed login attempt for email: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


    async def verify_refresh_token(self, token: str) -> tuple[str, str]:
        logging.debug(f"[TOKEN VERIFICATION] Verifying refresh token")
        
        try:
            payload = await self.jwt_manager.decode_jwt(token)
            user_id = payload.get("id")
            user_type = payload.get("type")

            logging.info(f"✅ [REFRESH TOKEN SUCCESS] Token verified for user_id={user_id}, user_type={user_type}")
            return await AuthService._generate_tokens(user_id, user_type)

        except jwt.ExpiredSignatureError:
            logging.error(f"❌ [EXPIRED TOKEN] Expired refresh token used")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        except jwt.PyJWTError as e:
            logging.error(f"❌ [INVALID TOKEN] Invalid refresh token: {str(e)}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid refresh token")


    async def _generate_tokens(self, user_id: int, user_type: str) -> tuple[str, str]:
        logging.debug(f"[TOKEN GENERATION] Generating new tokens for user_id={user_id}, user_type={user_type}")
        access_token = await self.jwt_manager.create_access_token({"id": user_id, "type": user_type})
        refresh_token = await self.jwt_manager.create_refresh_token({"id": user_id, "type": user_type})

        logging.debug(f"✅ [TOKEN GENERATED] Tokens successfully generated for user_id={user_id}, user_type={user_type}")
        return access_token, refresh_token

