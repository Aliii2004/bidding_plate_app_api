from fastapi import APIRouter
from ..routers.auth import router as auth_router
from ..routers.plates import router as plates_router
from ..routers.bids import router as bids_router
from ..routers.users import router as users_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(plates_router)
router.include_router(bids_router)