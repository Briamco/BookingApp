export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isConfirmed: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}