import os
import logging

from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.src.core.config import backend_config

DATABASE_URL = backend_config.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# Create the SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=True)
# Create a sessionmaker with AsyncSession
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
Base = declarative_base()

async def init_db():
    """
    Initializes the database by creating all tables.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logging.info("Database tables created successfully.")
    except Exception as e:
        logging.error(f"Error creating database tables: {e}")

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            logging.error(e)
            await session.rollback()
            raise HTTPException(status_code=500, detail="Database error")
        finally:
            if session:
                await session.close()
                logging.info("Session closed")