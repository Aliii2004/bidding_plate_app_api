import asyncio
from . import crud
from .websocket import notify_plate_update, notify_bid_update


# Wrapper functions that call the original CRUD operations and then notify clients
async def create_plate_ws(db, plate, user_id):
    """Create plate and notify connected clients"""
    result = crud.create_plate(db, plate, user_id)
    # Convert to dict for JSON serialization
    plate_dict = {
        "id": result.id,
        "plate_number": result.plate_number,
        "description": result.description,
        "deadline": result.deadline.isoformat(),
        "is_active": result.is_active,
        "created_by_id": result.created_by_id
    }
    # Schedule the notification as a background task
    asyncio.create_task(notify_plate_update("create", plate_dict))
    return result


async def update_plate_ws(db, plate_id, plate):
    """Update plate and notify connected clients"""
    result = crud.update_plate(db, plate_id, plate)
    plate_dict = {
        "id": result.id,
        "plate_number": result.plate_number,
        "description": result.description,
        "deadline": result.deadline.isoformat(),
        "is_active": result.is_active,
        "created_by_id": result.created_by_id
    }
    asyncio.create_task(notify_plate_update("update", plate_dict))
    return result


async def delete_plate_ws(db, plate_id):
    """Delete plate and notify connected clients"""
    result = crud.delete_plate(db, plate_id)
    asyncio.create_task(notify_plate_update("delete", {"id": plate_id}))
    return result


# Bid operations with WebSocket notifications
async def create_bid_ws(db, bid, user_id):
    """Create bid and notify connected clients"""
    result = crud.create_bid(db, bid, user_id)
    bid_dict = {
        "id": result.id,
        "amount": str(result.amount),
        "user_id": result.user_id,
        "plate_id": result.plate_id,
        "created_at": result.created_at.isoformat()
    }
    asyncio.create_task(notify_bid_update("create", bid_dict))
    return result


async def update_bid_ws(db, bid_id, bid, user_id):
    """Update bid and notify connected clients"""
    result = crud.update_bid(db, bid_id, bid, user_id)
    bid_dict = {
        "id": result.id,
        "amount": str(result.amount),
        "user_id": result.user_id,
        "plate_id": result.plate_id,
        "created_at": result.created_at.isoformat()
    }
    asyncio.create_task(notify_bid_update("update", bid_dict))
    return result


async def delete_bid_ws(db, bid_id, user_id):
    """Delete bid and notify connected clients"""
    # Get bid details before deletion to have the full data for notification
    bid = crud.get_bid(db, bid_id)
    bid_dict = {
        "id": bid.id,
        "amount": str(bid.amount),
        "user_id": bid.user_id,
        "plate_id": bid.plate_id,
        "created_at": bid.created_at.isoformat()
    }
    result = crud.delete_bid(db, bid_id, user_id)
    asyncio.create_task(notify_bid_update("delete", bid_dict))
    return result