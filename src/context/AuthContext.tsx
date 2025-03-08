import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void; // 🔄 Accepts user data instead of username/password
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
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("Login successful:", userData);
  };

  // 🟢 **Register Function**
  const register = async (formData: FormData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Registration successful:", response.data);
        window.location.href = "/login"; // 🔄 Redirects to login after success
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Registration failed");
    }
};

  // 🔴 **Logout Function**
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};