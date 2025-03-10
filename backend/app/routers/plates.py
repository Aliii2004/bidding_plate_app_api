from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_staff_user
from app.database import get_db

router = APIRouter(
    prefix="/plates",
    tags=["plates"]
)


@router.get("/", response_model=List[schemas.AutoPlate])
def read_plates(
    skip: int = 0,
    limit: int = 100,
    ordering: Optional[str] = Query(None, description="Order by field (e.g. 'deadline' or '-deadline')"),
    plate_number__contains: Optional[str] = Query(None, description="Filter by plate number containing this value"),
    db: Session = Depends(get_db)
):

    plates = crud.get_plates_with_highest_bids(
        db,
        skip=skip,
        limit=limit,
        ordering=ordering,
        plate_number_contains=plate_number__contains
    )
    return plates


@router.post("/", response_model=schemas.AutoPlate, status_code=201)
def create_plate(
    plate: schemas.AutoPlateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_staff_user)
):

    return crud.create_plate(db, plate, current_user.id)


@router.get("/{plate_id}", response_model=schemas.AutoPlateDetail)
def read_plate(
    plate_id: int,
    db: Session = Depends(get_db)
):
    db_plate = crud.get_plate_with_highest_bid(db, plate_id)
    if db_plate is None:
        raise HTTPException(status_code=404, detail="Plate not found")
    return db_plate


@router.put("/{plate_id}", response_model=schemas.AutoPlate)
def update_plate(
    plate_id: int,
    plate: schemas.AutoPlateUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_staff_user)
):
    if not current_user.is_staff:
        raise HTTPException(status_code=403, detail="Only staff users can update plate")
    return crud.update_plate(db, plate_id, plate)


@router.delete("/{plate_id}")
def delete_plate(
    plate_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_staff_user)
):
    if not current_user.is_staff:
        raise HTTPException(status_code=403, detail="Only staff users can delete plate")
    return crud.delete_plate(db, plate_id)