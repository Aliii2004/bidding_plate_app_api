from typing import Optional
from fastapi import WebSocket, status
from jose import JWTError, jwt

from . import models
from .auth import SECRET_KEY, ALGORITHM, get_user
from .database import SessionLocal

async def get_current_user_ws(websocket: WebSocket, token: str):
    """
    Validate token from WebSocket query parameter
    Returns user if token is valid, None otherwise
    """
    try:
        db = SessionLocal()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        user = get_user(db, username=username)
        db.close()
        return user
    except JWTError:
        return None
    except Exception:
        return None