from fastapi import APIRouter
from src.routers.v1.auth_router import router as auth_router
from src.routers.v1.admin_router import router as admin_router
from src.routers.v1.hr_router import router as hr_router
from src.routers.v1.user_router import router as user_router

routers = APIRouter(prefix="/api/v1")

routers.include_router(auth_router)
routers.include_router(admin_router)
routers.include_router(hr_router)
routers.include_router(user_router)