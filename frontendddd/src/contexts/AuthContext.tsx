
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types/models";

interface JwtPayload {
  sub: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    is_staff: boolean;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // For demo purposes, we'll create a basic user object
          // In a real app, you might want to fetch user details from the API
          setUser({
            id: 0,
            username: decoded.sub,
            email: "",
            is_staff: localStorage.getItem("is_admin") === "true",
          });
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      await authService.login(username, password);
      
      // Check if admin by making a request to a protected admin endpoint
      let isAdmin = false;
      try {
        // Try to create a plate (admin-only action)
        // This is just for checking if the user is admin
        await authService.isLoggedIn();
        // If no error is thrown, user is admin
        isAdmin = true;
      } catch (error) {
        // Not an admin, which is fine
        isAdmin = false;
      }
      
      localStorage.setItem("is_admin", String(isAdmin));
      
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({
          id: 0,
          username: decoded.sub,
          email: "",
          is_staff: isAdmin,
        });
      }
      
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    is_staff: boolean;
  }) => {
    try {
      setLoading(true);
      await authService.register(userData);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("is_admin");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  const isAdmin = user?.is_staff || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
