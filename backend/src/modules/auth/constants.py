from fastapi.security import OAuth2PasswordBearer

reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
)

BLACKLIST = set()