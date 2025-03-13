
export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AutoPlate {
  id: number;
  plate_number: string;
  description: string;
  deadline: string;
  is_active: boolean;
  created_by_id: number;
  highest_bid?: string | null;
}

export interface Bid {
  id: number;
  amount: string;
  user_id: number;
  plate_id: number;
  created_at: string;
}

export interface AutoPlateDetail extends AutoPlate {
  bids: Bid[];
}

export interface BidCreate {
  amount: number;
  plate_id: number;
}

export interface BidUpdate {
  amount: number;
}

export interface PlateCreate {
  plate_number: string;
  description: string;
  deadline: string;
}

export interface PlateUpdate {
  plate_number?: string;
  description?: string;
  deadline?: string;
  is_active?: boolean;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  is_staff: boolean;
}
