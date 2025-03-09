import React, { createContext, useState, useEffect, ReactNode } from "react";
import apiClient from "../services/api-client";
import { AxiosError } from "axios";

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔵 **Login Function**
  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<User>("/auth/login", { username, password });
      const userData = response.data; // Extract full user object
  
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData)); // Store the full user object
  
      console.log("✅ Login successful:", userData);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Login failed:", axiosError.response?.data || axiosError);
      throw new Error((axiosError.response?.data as { message: string })?.message || "Login failed");
    }
  };  

  // 🟢 **Register Function**
  const register = async (formData: FormData) => {
    try {
      const response = await apiClient.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Registration successful:", response.data);
      window.location.href = "/login"; // 🔄 Redirect to login after success
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Registration failed:", axiosError.response?.data || axiosError);
      throw new Error((axiosError.response?.data as { message: string })?.message || "Registration failed");
    }
  };

  // 🔴 **Logout Function**
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    console.log("🔴 Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};