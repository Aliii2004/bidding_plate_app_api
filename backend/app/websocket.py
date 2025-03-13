from typing import Dict, List, Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Store all active connections
        self.active_connections: Dict[str, List[WebSocket]] = {
            "plates": [],
            "bids": []
        }

    async def connect(self, websocket: WebSocket, client_type: str):
        await websocket.accept()
        if client_type not in self.active_connections:
            self.active_connections[client_type] = []
        self.active_connections[client_type].append(websocket)

    def disconnect(self, websocket: WebSocket, client_type: str):
        if client_type in self.active_connections:
            if websocket in self.active_connections[client_type]:
                self.active_connections[client_type].remove(websocket)

    async def broadcast(self, message: Any, client_type: str):
        """Send a message to all connected clients of a specific type"""
        for connection in self.active_connections.get(client_type, []):
            try:
                await connection.send_json(message)
            except RuntimeError:
                # Client might have disconnected
                self.disconnect(connection, client_type)


# Create a global connection manager instance
manager = ConnectionManager()


# Event handlers
async def notify_plate_update(action: str, plate_data: dict):
    """Notify all clients about plate changes"""
    await manager.broadcast(
        {
            "action": action,  # "create", "update", or "delete"
            "resource_type": "plate",
            "data": plate_data
        },
        "plates"
    )


async def notify_bid_update(action: str, bid_data: dict):
    """Notify all clients about bid changes"""
    await manager.broadcast(
        {
            "action": action,  # "create", "update", or "delete"
            "resource_type": "bid",
            "data": bid_data
        },
        "bids"
    )


    # Also broadcast to plates channel as bids affect plates
    await manager.broadcast(
        {
            "action": f"bid_{action}",
            "resource_type": "bid_on_plate",
            "plate_id": bid_data.get("plate_id"),
            "data": bid_data
        },
        "plates"
    )