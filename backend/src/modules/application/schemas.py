from typing import Optional
from pydantic import BaseModel

class CandidateResponseSchema(BaseModel):
    application_id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    resume_link: Optional[str]
    profession: str
    matching_score: Optional[float]
    status: str
    summary: str

    class Config:
        orm_mode = True
