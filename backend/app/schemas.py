from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal
from zoneinfo import ZoneInfo
from pydantic import BaseModel, field_validator, Field


# User schemas
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str
    is_staff: bool = False


class User(UserBase):
    id: int
    is_staff: bool

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# Auto Plate schemas
class AutoPlateBase(BaseModel):
    plate_number: str
    description: str
    deadline: datetime


class AutoPlateCreate(AutoPlateBase):
    @classmethod
    @field_validator('deadline')
    def deadline_must_be_future(cls, v):
        if v <= datetime.now():
            raise ValueError('Deadline must be in the future')
        return v

    @classmethod
    @field_validator('plate_number')
    def plate_number_must_be_valid(cls, v):
        if len(v) > 10:
            raise ValueError('Plate number must be 10 characters or less')
        return v


class AutoPlateUpdate(BaseModel):
    plate_number: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None

    @classmethod
    @field_validator('deadline')
    def deadline_must_be_future(cls, v):
        if v and v <= datetime.now():
            raise ValueError('Deadline must be in the future')
        return v

    @classmethod
    @field_validator('plate_number')
    def plate_number_must_be_valid(cls, v):
        if v and len(v) > 10:
            raise ValueError('Plate number must be 10 characters or less')
        return v


class BidInfo(BaseModel):
    id: int
    amount: Decimal
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AutoPlate(AutoPlateBase):
    id: int
    is_active: bool
    created_by_id: int
    highest_bid: Optional[Decimal] = None

    class Config:
        from_attributes = True


class AutoPlateDetail(AutoPlate):
    bids: List[BidInfo]

    class Config:
        from_attributes = True


# Bid schemas
class BidBase(BaseModel):
    amount: Decimal = Field(..., gt=0)


class BidCreate(BidBase):
    plate_id: int


class BidUpdate(BidBase):
    pass


class Bid(BidBase):
    id: int
    user_id: int
    plate_id: int
    created_at: datetime

    class Config:
        from_attributes = True