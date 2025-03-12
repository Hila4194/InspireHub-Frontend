import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import apiClient from "../services/api-client";
import { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // 🔹 Allow updates to user state
  login: (username: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  updateProfile: (updatedData: Partial<User & { profilePicture?: File }>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // ✅ Ensure the profile picture URL is absolute
      if (parsedUser.profilePicture && parsedUser.profilePicture.startsWith("/uploads/")) {
        parsedUser.profilePicture = `${API_BASE_URL}${parsedUser.profilePicture}`;
      }

      setUser(parsedUser);
    }
  }, []);

  // 🔵 **Login Function**
const login = async (username: string, password: string) => {
  try {
      const response = await apiClient.post<User>("/auth/login", { username, password });
      const userData = response.data;

      console.log("✅ Debug: Received User Data:", userData);

      // ✅ Ensure API_BASE_URL is correctly defined
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");

      // ✅ Ensure the profile picture URL is absolute
      if (userData.profilePicture && !userData.profilePicture.startsWith("http")) {
          userData.profilePicture = `${apiBaseUrl}${userData.profilePicture.startsWith("/") ? "" : "/"}${userData.profilePicture}`;
      }

      console.log("✅ Debug: Processed Profile Picture URL:", userData.profilePicture);

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
      setUser((prevUser) => prevUser ? { ...prevUser, accessToken: newAccessToken } : null);

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

  // ✏ **Update Profile Function**
  const updateProfile = async (updatedData: Partial<User> | FormData): Promise<void> => {
    if (!user) return;

    try {
        const isFormData = updatedData instanceof FormData;

        const headers: Record<string, string> = {
            Authorization: `JWT ${user.accessToken}`,
        };

        // ✅ Only add Content-Type for JSON requests, not FormData
        if (!isFormData) {
            headers["Content-Type"] = "application/json";
        }

        const res = await apiClient.put(
            `/auth/update-profile/${user._id}`,
            updatedData,
            { headers }
        );

        const updatedUser: User = res.data;

        // ✅ Ensure profile picture URL is absolute
        if (updatedUser.profilePicture && !updatedUser.profilePicture.startsWith("http")) {
            updatedUser.profilePicture = `${API_BASE_URL}${updatedUser.profilePicture}`;
        }

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("✅ Profile updated successfully:", updatedUser);
    } catch (error) {
        console.error("❌ Failed to update profile:", error);
        throw error;
    }
};

  // 🔴 **Logout Function**
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    console.log("🔴 Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshAccessToken, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};