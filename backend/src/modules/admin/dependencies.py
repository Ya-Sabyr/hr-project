from .services.admin_service import AdminService
from .crud import AdminDatabase
from .services.hr_admin_service import HRAdminService
from .crud import AdminHRDatabase
from .services.user_admin_service import UserAdminService
from .crud import AdminUserDatabase


def get_admin_service():
    return AdminService(
        admin_database=AdminDatabase()
    )

def get_admin_hr_service():
    return HRAdminService(
        hr_admin_db=AdminHRDatabase()
    )

def get_admin_user_service():
    return UserAdminService(
        admin_user_db=AdminUserDatabase()
    )