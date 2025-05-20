import logging

from fastapi import FastAPI
from src.core.config import backend_config
from src.router import routers
from starlette.middleware.cors import CORSMiddleware
from src.core.database import init_db, engine

app = FastAPI(debug=backend_config.DEBUG)

app.include_router(routers)

app.add_middleware(
    CORSMiddleware,
    allow_origins=backend_config.ALLOWED_HOSTS,  # List of allowed origins, use ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],  # List of allowed HTTP methods, use ["*"] to allow all
    allow_headers=["*"],  # List of allowed headers, use ["*"] to allow all
)

@app.on_event("startup")
async def startup_event():
    
    backend_config.configure_logging()
    logging.info("Starting application...")
    logging.debug(f'Debug mode: {backend_config.DEBUG}')
    # logging.info(f'Allowed hosts: {backend_config.ALLOWED_HOSTS}')
    
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await engine.dispose()
    logging.info("Database engine disposed.")