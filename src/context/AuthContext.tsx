import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
    user: User | null;
    login: (userData: LoginData) => Promise<void>;
    logout: () => void;
}

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    accessToken: string;
}

interface LoginData {
    username: string;
    password: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Login function
    const login = async (userData: LoginData) => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                username: userData.username,
                password: userData.password,
            });

            const loggedInUser: User = {
                _id: response.data._id,
                username: response.data.username,
                profilePicture: response.data.profilePicture,
                accessToken: response.data.accessToken,
            };

            setUser(loggedInUser);
            localStorage.setItem("user", JSON.stringify(loggedInUser));
        } catch {
            throw new Error("Invalid username or password");
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    // Automatically load user from localStorage when the app starts
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};