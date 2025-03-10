from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(
    prefix="/bids",
    tags=["bids"]
)


@router.get("/", response_model=List[schemas.Bid])
def read_bids(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_staff:
        raise HTTPException(detail='You are not allowed to do this', status_code=403)
    bids = crud.get_bids_by_user(db, current_user.id, skip=skip, limit=limit)

    return bids


@router.post("/", response_model=schemas.Bid, status_code=201)
def create_bid(
    bid: schemas.BidCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_staff:
        raise HTTPException(detail='You are not allowed to do this', status_code=403)
    return crud.create_bid(db, bid, current_user.id)


@router.get("/{bid_id}", response_model=schemas.Bid)
def read_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_staff:
        raise HTTPException(detail='You are not allowed to do this', status_code=403)

    db_bid = crud.get_bid(db, bid_id)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")

    if db_bid.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view this bid"
        )

    return db_bid


@router.put("/{bid_id}", response_model=schemas.Bid)
def update_bid(
    bid_id: int,
    bid: schemas.BidUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_staff:
        raise HTTPException(detail='You are not allowed to do this', status_code=403)
    return crud.update_bid(db, bid_id, bid, current_user.id)


@router.delete("/{bid_id}")
def delete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_staff:
        raise HTTPException(detail='You are not allowed to do this', status_code=403)
    return crud.delete_bid(db, bid_id, current_user.id)