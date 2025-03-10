from fastapi import FastAPI
from app import routers
from app.database import engine, Base

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(routers.router)


















