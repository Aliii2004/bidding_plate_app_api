from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from . import routers
from .database import engine, Base
from starlette.middleware.cors import CORSMiddleware
from .websocket import manager
# from .auth_ws import get_current_user_ws
# import json

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(routers.router)


@app.websocket("/ws/plates")
async def websocket_plates(websocket: WebSocket):
    await manager.connect(websocket, "plates")
    try:
        while True:
            # Keep the connection alive, wait for client messages but don't do anything with them
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "plates")


@app.websocket("/ws/bids")
async def websocket_bids(websocket: WebSocket):
    await manager.connect(websocket, "bids")
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "bids")


# Remove the get_app function since we're creating the app directly
def get_application():
    return app



# from fastapi import FastAPI
# from . import routers
# from .database import engine, Base
# from starlette.middleware.cors import CORSMiddleware
# Base.metadata.create_all(bind=engine)
#
#
# def get_app() -> CORSMiddleware:
#     app = FastAPI()
#     app.include_router(routers.router)
#     return CORSMiddleware(
#         app=app,
#         allow_origins=["*"],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )