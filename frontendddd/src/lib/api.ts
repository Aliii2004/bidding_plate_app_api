
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_URL = "http://localhost:8000"; // Change this to your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = 
      error.response?.data?.detail || 
      error.message || 
      "An error occurred";
    
    toast({
      title: "Error",
      description: typeof message === 'string' ? message : JSON.stringify(message),
      variant: "destructive",
    });
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    
    const response = await api.post("/login/", formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    is_staff: boolean;
  }) => {
    const response = await api.post("/users/", userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem("token");
  },
  
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },
};

// Plate services
export const plateService = {
  getPlates: async (params?: {
    skip?: number;
    limit?: number;
    ordering?: string;
    plate_number__contains?: string;
  }) => {
    const response = await api.get("/plates/", { params });
    return response.data;
  },
  
  getPlateById: async (id: number) => {
    const response = await api.get(`/plates/${id}`);
    return response.data;
  },
  
  createPlate: async (plateData: {
    plate_number: string;
    description: string;
    deadline: string;
  }) => {
    const response = await api.post("/plates/", plateData);
    return response.data;
  },
  
  updatePlate: async (id: number, plateData: {
    plate_number?: string;
    description?: string;
    deadline?: string;
    is_active?: boolean;
  }) => {
    const response = await api.put(`/plates/${id}`, plateData);
    return response.data;
  },
  
  deletePlate: async (id: number) => {
    const response = await api.delete(`/plates/${id}`);
    return response.data;
  },
};

// Bid services
export const bidService = {
  getUserBids: async (params?: {
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get("/bids/", { params });
    return response.data;
  },
  
  getBidById: async (id: number) => {
    const response = await api.get(`/bids/${id}`);
    return response.data;
  },
  
  createBid: async (bidData: {
    amount: number;
    plate_id: number;
  }) => {
    const response = await api.post("/bids/", bidData);
    return response.data;
  },
  
  updateBid: async (id: number, bidData: {
    amount: number;
  }) => {
    const response = await api.put(`/bids/${id}`, bidData);
    return response.data;
  },
  
  deleteBid: async (id: number) => {
    const response = await api.delete(`/bids/${id}`);
    return response.data;
  },
};

export default api;
