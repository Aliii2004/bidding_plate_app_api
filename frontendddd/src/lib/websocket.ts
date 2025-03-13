
import { toast } from "@/hooks/use-toast";

export type WebSocketMessage = {
  action: string;
  resource_type: string;
  data: any;
  plate_id?: number;
};

class WebSocketService {
  private platesSocket: WebSocket | null = null;
  private bidsSocket: WebSocket | null = null;
  private platesListeners: ((message: WebSocketMessage) => void)[] = [];
  private bidsListeners: ((message: WebSocketMessage) => void)[] = [];
  private baseUrl: string;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  constructor() {
    // Get the API URL from the environment or use default
    const apiUrl = "http://localhost:8000"; // Same as API_URL from api.ts
    // Replace http with ws for WebSocket connection
    this.baseUrl = apiUrl.replace(/^http/, 'ws');
  }

  connectToPlates() {
    if (this.platesSocket?.readyState === WebSocket.OPEN) return;

    this.platesSocket = new WebSocket(`${this.baseUrl}/ws/plates`);

    this.platesSocket.onopen = () => {
      console.log("Connected to plates WebSocket");
      this.reconnectAttempts = 0;
    };

    this.platesSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("Received plates message:", message);
        this.platesListeners.forEach(listener => listener(message));
      } catch (error) {
        console.error("Error parsing plates WebSocket message:", error);
      }
    };

    this.platesSocket.onerror = (error) => {
      console.error("Plates WebSocket error:", error);
    };

    this.platesSocket.onclose = (event) => {
      console.log("Plates WebSocket closed:", event);
      this.platesSocket = null;
      this.handleReconnect('plates');
    };
  }

  connectToBids() {
    if (this.bidsSocket?.readyState === WebSocket.OPEN) return;

    this.bidsSocket = new WebSocket(`${this.baseUrl}/ws/bids`);

    this.bidsSocket.onopen = () => {
      console.log("Connected to bids WebSocket");
      this.reconnectAttempts = 0;
    };

    this.bidsSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("Received bids message:", message);
        this.bidsListeners.forEach(listener => listener(message));
      } catch (error) {
        console.error("Error parsing bids WebSocket message:", error);
      }
    };

    this.bidsSocket.onerror = (error) => {
      console.error("Bids WebSocket error:", error);
    };

    this.bidsSocket.onclose = (event) => {
      console.log("Bids WebSocket closed:", event);
      this.bidsSocket = null;
      this.handleReconnect('bids');
    };
  }

  private handleReconnect(socketType: 'plates' | 'bids') {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast({
        title: "Connection Failed",
        description: "Unable to establish real-time connection. You may need to refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect to ${socketType} WebSocket, attempt ${this.reconnectAttempts}`);
      if (socketType === 'plates') {
        this.connectToPlates();
      } else {
        this.connectToBids();
      }
    }, delay);
  }

  addPlatesListener(listener: (message: WebSocketMessage) => void) {
    this.platesListeners.push(listener);
    if (!this.platesSocket || this.platesSocket.readyState !== WebSocket.OPEN) {
      this.connectToPlates();
    }
    return () => {
      this.platesListeners = this.platesListeners.filter(l => l !== listener);
    };
  }

  addBidsListener(listener: (message: WebSocketMessage) => void) {
    this.bidsListeners.push(listener);
    if (!this.bidsSocket || this.bidsSocket.readyState !== WebSocket.OPEN) {
      this.connectToBids();
    }
    return () => {
      this.bidsListeners = this.bidsListeners.filter(l => l !== listener);
    };
  }

  disconnect() {
    if (this.platesSocket) {
      this.platesSocket.close();
      this.platesSocket = null;
    }

    if (this.bidsSocket) {
      this.bidsSocket.close();
      this.bidsSocket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.platesListeners = [];
    this.bidsListeners = [];
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
