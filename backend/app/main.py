from fastapi import FastAPI
from . import routers
from .database import engine, Base
from starlette.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)


def get_app() -> CORSMiddleware:
    app = FastAPI()
    app.include_router(routers.router)
    return CORSMiddleware(
        app=app,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


















