from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_staff = Column(Boolean, default=False)

    # Relationships
    plates_created = relationship("AutoPlate", back_populates="created_by")
    bids = relationship("Bid", back_populates="user")


class AutoPlate(Base):
    __tablename__ = "auto_plates"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(10), unique=True, index=True)
    description = Column(Text)
    deadline = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_by_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    created_by = relationship("User", back_populates="plates_created")
    bids = relationship("Bid", back_populates="plate", cascade="all, delete-orphan")


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(10, 2))
    user_id = Column(Integer, ForeignKey("users.id"))
    plate_id = Column(Integer, ForeignKey("auto_plates.id"))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="bids")
    plate = relationship("AutoPlate", back_populates="bids")

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'plate_id', name='unique_user_plate_bid'),
    )


