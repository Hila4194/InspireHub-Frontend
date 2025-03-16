import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api-client";
import axios from "axios";
import "../styles/register.css";
import defaultAvatar from "../assets/default-avatar.png";
import maleAvatar from "../assets/male-avatar.png";
import femaleAvatar from "../assets/female-avatar.png";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

// Zod Schema for Validation
const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: "Username must contain both letters and numbers",
    }),

  email: z.string().email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const RegisterPage = () => {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(defaultAvatar);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();

  const previewImage = profilePicture ? URL.createObjectURL(profilePicture) : selectedAvatar;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setSelectedAvatar(null);
    }
  };

  // Handle Avatar Selection
  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setProfilePicture(null);
  };

  // Convert avatar URL to File object
  const getAvatarFile = async (avatarUrl: string): Promise<File> => {
    const response = await fetch(avatarUrl);
    const blob = await response.blob();
    return new File([blob], avatarUrl.includes("male") ? "male-avatar.png" : "female-avatar.png", { type: "image/png" });
  };

  // Validate Inputs using Zod
  const validateInputs = () => {
    const result = registerSchema.safeParse({ username, email, password });
    if (!result.success) {
      const newErrors: {
        username?: string;
        email?: string;
        password?: string;
      } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "username") newErrors.username = err.message;
        if (err.path[0] === "email") newErrors.email = err.message;
        if (err.path[0] === "password") newErrors.password = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validateInputs()) {
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    } else if (selectedAvatar) {
      const avatarFile = await getAvatarFile(selectedAvatar);
      formData.append("profilePicture", avatarFile);
    }

    try {
      const response = await apiClient.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Registration Response:", response);
      if (response.status === 201) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(response.data.message || "❌ Registration failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Registration failed:", error.response?.data);
        setMessage(error.response?.data?.message || "❌ Registration failed");
      } else {
        console.error("❌ Unexpected Error:", error);
        setMessage("An unexpected error occurred");
      }
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
    <div className="register-container">
      <div className="register-card">
        <h2 style={{ color: "white", textDecoration: "underline" }}>Register</h2>
        <div className="profile-picture-container">
          <img
            src={previewImage || ""}
            alt="Profile Preview"
            className="profile-picture"
          />
        </div>
        <div className="avatar-selection">
        <h4>Choose an Avatar (Optional)</h4>
        <div className="avatar-options">
          <img src={maleAvatar} alt="Male Avatar" className={`avatar-option ${selectedAvatar === maleAvatar ? "selected" : ""}`} onClick={() => handleAvatarSelect(maleAvatar)} />
          <img src={femaleAvatar} alt="Female Avatar" className={`avatar-option ${selectedAvatar === femaleAvatar ? "selected" : ""}`} onClick={() => handleAvatarSelect(femaleAvatar)} />
        </div>
      </div>
        <div className="upload-button-container">
          <label
            htmlFor="profile-picture"
            className="btn btn-primary upload-button"
          >
            <i className="fas fa-upload"></i> Upload Profile Picture
          </label>
          <input
            type="file"
            id="profile-picture"
            className="d-none"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        {message && <p className={`mt-3 ${message.startsWith("✅") ? "text-success" : "text-danger"}`}>{message}</p>}
        <p className="mt-3">Already have an account? <Link to="/login">Login here</Link></p>
        <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={onGoogleLoginError} theme="outline" size="large" />
      </div>
    </div>
  );
};

export default RegisterPage;