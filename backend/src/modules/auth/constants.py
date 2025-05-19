from fastapi.security import OAuth2PasswordBearer

reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="auth/login",
)

BLACKLIST = set()