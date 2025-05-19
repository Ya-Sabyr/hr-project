import logging

from fastapi import FastAPI
from backend.src.core.config import backend_config
from src.routers import routers
from starlette.middleware.cors import CORSMiddleware
from backend.src.core.database import init_db

app = FastAPI(debug=backend_config.DEBUG)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[host.strip() for host in backend_config.ALLOWED_HOSTS],  # List of allowed origins, use ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],  # List of allowed HTTP methods, use ["*"] to allow all
    allow_headers=["*"],  # List of allowed headers, use ["*"] to allow all
)

app.include_router(routers)

@app.on_event("startup")
async def startup_event():
    
    backend_config.configure_logging()
    logging.info("Starting application...")
    logging.debug(f'Debug mode: {backend_config.DEBUG}')
    logging.info(f'Allowed hosts: {backend_config.ALLOWED_HOSTS}')
    
    await init_db()