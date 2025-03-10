from datetime import datetime
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas
from .auth import get_password_hash


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_staff=user.is_staff
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_plates(db: Session, skip: int = 0, limit: int = 100,
               ordering: Optional[str] = None,
               plate_number_contains: Optional[str] = None):
    query = db.query(models.AutoPlate)

    if plate_number_contains:
        query = query.filter(models.AutoPlate.plate_number.contains(plate_number_contains))

    if ordering == "deadline":
        query = query.order_by(models.AutoPlate.deadline)
    elif ordering == "-deadline":
        query = query.order_by(models.AutoPlate.deadline.desc())

    return query.offset(skip).limit(limit).all()


def get_plate(db: Session, plate_id: int):
    return db.query(models.AutoPlate).filter(models.AutoPlate.id == plate_id).first()


def create_plate(db: Session, plate: schemas.AutoPlateCreate, user_id: int):

    existing_plate = db.query(models.AutoPlate).filter(
        models.AutoPlate.plate_number == plate.plate_number
    ).first()

    if existing_plate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plate number already exists"
        )

    db_plate = models.AutoPlate(
        plate_number=plate.plate_number,
        description=plate.description,
        deadline=plate.deadline,
        created_by_id=user_id
    )
    db.add(db_plate)
    db.commit()
    db.refresh(db_plate)
    return db_plate


def update_plate(db: Session, plate_id: int, plate: schemas.AutoPlateUpdate):
    db_plate = get_plate(db, plate_id)

    if not db_plate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plate not found"
        )

    if plate.plate_number and plate.plate_number != db_plate.plate_number:
        existing_plate = db.query(models.AutoPlate).filter(
            models.AutoPlate.plate_number == plate.plate_number
        ).first()

        if existing_plate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plate number already exists"
            )

    if plate.plate_number:
        db_plate.plate_number = plate.plate_number
    if plate.description:
        db_plate.description = plate.description
    if plate.deadline:
        db_plate.deadline = plate.deadline
    if plate.is_active is not None:
        db_plate.is_active = plate.is_active

    db.commit()
    db.refresh(db_plate)
    return db_plate


def delete_plate(db: Session, plate_id: int):
    db_plate = get_plate(db, plate_id)

    if not db_plate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plate not found"
        )

    if db.query(models.Bid).filter(models.Bid.plate_id == plate_id).count() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete plate with active bids"
        )

    db.delete(db_plate)
    db.commit()
    return {"detail": "Plate deleted successfully"}


def get_plate_with_highest_bid(db: Session, plate_id: int):
    plate = get_plate(db, plate_id)

    if not plate:
        return None

    highest_bid = db.query(func.max(models.Bid.amount)).filter(
        models.Bid.plate_id == plate_id
    ).scalar()

    bids = db.query(models.Bid).filter(models.Bid.plate_id == plate_id).all()

    return {
        "id": plate.id,
        "plate_number": plate.plate_number,
        "description": plate.description,
        "deadline": plate.deadline,
        "is_active": plate.is_active,
        "created_by_id": plate.created_by_id,
        "highest_bid": highest_bid,
        "bids": bids
    }


def get_plates_with_highest_bids(db: Session, skip: int = 0, limit: int = 100,
                                 ordering: Optional[str] = None,
                                 plate_number_contains: Optional[str] = None):
    plates = get_plates(db, skip, limit, ordering, plate_number_contains)
    result = []

    for plate in plates:
        highest_bid = db.query(func.max(models.Bid.amount)).filter(
            models.Bid.plate_id == plate.id
        ).scalar()

        plate_dict = {
            "id": plate.id,
            "plate_number": plate.plate_number,
            "description": plate.description,
            "deadline": plate.deadline,
            "is_active": plate.is_active,
            "created_by_id": plate.created_by_id,
            "highest_bid": highest_bid
        }

        result.append(plate_dict)

    return result


# Bid operations
def get_bids_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Bid).filter(
        models.Bid.user_id == user_id
    ).offset(skip).limit(limit).all()


def get_bid(db: Session, bid_id: int):
    return db.query(models.Bid).filter(models.Bid.id == bid_id).first()


def create_bid(db: Session, bid: schemas.BidCreate, user_id: int):
    # Check if plate exists and is active
    plate = get_plate(db, bid.plate_id)

    if not plate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plate not found"
        )
    if not plate.is_active or plate.deadline <= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bidding is closed"
        )

    existing_bid = db.query(models.Bid).filter(
        models.Bid.user_id == user_id,
        models.Bid.plate_id == bid.plate_id
    ).first()

    if existing_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a bid on this plate"
        )

    highest_bid = db.query(func.max(models.Bid.amount)).filter(
        models.Bid.plate_id == bid.plate_id
    ).scalar()

    if highest_bid and bid.amount <= highest_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid must exceed current highest bid"
        )

    db_bid = models.Bid(
        amount=bid.amount,
        user_id=user_id,
        plate_id=bid.plate_id
    )
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    return db_bid

def update_bid(db: Session, bid_id: int, bid: schemas.BidUpdate, user_id: int):
    db_bid = get_bid(db, bid_id)

    if not db_bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check if user owns the bid
    if db_bid.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this bid"
        )

    # Check if bidding is still open
    plate = get_plate(db, db_bid.plate_id)
    if not plate.is_active or plate.deadline <= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bidding period has ended"
        )

    # Check if new bid is higher than current highest bid
    highest_bid = db.query(func.max(models.Bid.amount)).filter(
        models.Bid.plate_id == db_bid.plate_id,
        models.Bid.id != bid_id  # Exclude current bid
    ).scalar()

    if highest_bid and bid.amount <= highest_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid must exceed current highest bid"
        )

    db_bid.amount = bid.amount
    db.commit()
    db.refresh(db_bid)
    return db_bid


def delete_bid(db: Session, bid_id: int, user_id: int):
    db_bid = get_bid(db, bid_id)

    if not db_bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check if user owns the bid
    if db_bid.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this bid"
        )

    # Check if bidding is still open
    plate = get_plate(db, db_bid.plate_id)
    if not plate.is_active or plate.deadline <= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bidding period has ended"
        )

    db.delete(db_bid)
    db.commit()
    return {"detail": "Bid deleted successfully"}


