import logging
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class JWTManager:
    def __init__(self, secret_key: str, algorithm: str, access_expiry: int, refresh_expiry: int):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expiry = access_expiry
        self.refresh_expiry = refresh_expiry

    async def create_refresh_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=self.refresh_expiry))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def create_access_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=self.access_expiry))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def decode_jwt(self, token: str):
        logging.debug(f"Decoding token: {token}")
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            logging.debug("Token expired")
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            logging.debug("Invalid token")
            raise HTTPException(status_code=401, detail="Invalid token")

    async def verify_account(self, token: str, db: AsyncSession):
        try:
            payload = await self.decode_jwt(token)
            user_id = payload.get("id")
            email = payload.get("sub")
            role = payload.get("role")

            data = {"id": user_id, "sub": email, "role": role}
            access_token = await self.create_access_token(data=data)
            refresh_token = await self.create_refresh_token(data=data)

            await db.execute(
                update(User).where(User.id == user_id).values(
                    blocked=False,
                    updated_at=datetime.utcnow()
                )
            )
            return access_token, refresh_token

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Refresh token has expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=403, detail="Invalid refresh token")

    @staticmethod
    def model_to_dict(model):
        return {key: value for key, value in vars(model).items() if not key.startswith('_')}
