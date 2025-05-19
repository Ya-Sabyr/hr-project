from fastapi import APIRouter
from src.auth.router import router as auth_router
from src.admin.router import router as admin_router
from src.hr.router import router as hr_router
from src.user.router import router as user_router

routers = APIRouter(prefix="/api/v1")

routers.include_router(auth_router)
routers.include_router(admin_router)
routers.include_router(hr_router)
routers.include_router(user_router)