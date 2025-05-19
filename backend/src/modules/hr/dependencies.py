from .service import HRService
from .crud import HRDatabase

def get_hr_service():
    return HRService(
        hr_database=HRDatabase()
    )