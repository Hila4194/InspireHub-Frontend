import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../services/api-client";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import "../styles/login.css";

const LoginPage = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("AuthContext is null");
    }
    const { login, setUser } = authContext;
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // ✅ Handle Standard Login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid username or password. Please try again.");
            console.error("❌ Login Error:", error);
        }
    };

    // ✅ Google Sign-in API Call
    const googleSignin = async (credentialResponse: CredentialResponse) => {
        try {
            console.log("Google Signin!", credentialResponse);

            const { credential } = credentialResponse;
            if (!credential) {
                throw new Error("Google credential is missing");
            }

            const response = await apiClient.post("/auth/google", { credential });

            console.log("✅ Google Signin success!", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Google Signin error!", error);
            throw error;
        }
    };

    // ✅ Google Sign-in Success Handler
    const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        console.log("✅ Google login successful!", credentialResponse);
        try {
            const res = await googleSignin(credentialResponse);

            localStorage.setItem("user", JSON.stringify(res));
            setUser(res);

            console.log("Google Signin success!", res);
            navigate("/dashboard");
        } catch (error) {
            console.log("Google Signin error!", error);
        }
    };

    const onGoogleLoginError = () => {
        console.error("🛑 Google login failed!");
    };

    return (
        <div className="login-container">
            <div className="login-card">
            <h2 className="text-center" style={{ color: "white", textDecoration: "underline" }}>Login</h2>
                {error && <div className="alert alert-danger text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                <div className="text-center mt-3">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
                <div className="text-center mt-3">
                    <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={onGoogleLoginError} theme="outline" size="large" />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;