import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import apiClient from "../services/api-client";
import { AxiosError } from "axios";

// ✅ User Interface
interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  accessToken: string;
  refreshToken: string;
}

// ✅ AuthContext Type
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Custom Hook for easy access to AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
      const userData = response.data;
  
      // Ensure the profile picture URL is absolute
      if (userData.profilePicture && !userData.profilePicture.startsWith("http")) {
        userData.profilePicture = `${import.meta.env.VITE_API_BASE_URL}${userData.profilePicture}`;
      }
  
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw new Error("Login failed");
    }
  };
    
  // 🔄 **Refresh Token Function**
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      if (!user?.refreshToken) {
        console.warn("⚠️ No refresh token available");
        logout();
        return null;
      }

      const response = await apiClient.post<{ accessToken: string }>("/auth/refresh-token", {
        token: user.refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      setUser((prevUser) => (prevUser ? { ...prevUser, accessToken: newAccessToken } : null));

      localStorage.setItem("user", JSON.stringify({ ...user, accessToken: newAccessToken }));

      console.log("🔄 Access token refreshed:", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("❌ Failed to refresh token:", error);
      logout();
      return null;
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
    <AuthContext.Provider value={{ user, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};