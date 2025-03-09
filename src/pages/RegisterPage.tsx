import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import apiClient from "../services/api-client";
import axios from "axios";
import "../styles/register.css";
import defaultAvatar from "../assets/default-avatar.png";

// Zod Schema for Validation
const registerSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: "Username must contain both letters and numbers" }),

  email: z.string()
    .email({ message: "Invalid email format" }),

  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(defaultAvatar);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Validation state
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file)); // Preview the selected image
    }
  };

  // Validate Inputs using Zod
  const validateInputs = () => {
    const result = registerSchema.safeParse({ username, email, password });
    if (!result.success) {
      const newErrors: { username?: string; email?: string; password?: string } = {};
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
      return; // Stop submission if validation fails
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePicture) formData.append("profilePicture", profilePicture);

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

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        
        {/* Profile Picture Preview */}
        <div className="profile-picture-container">
          <img src={previewImage} alt="Profile Preview" className="profile-picture" />
        </div>

        {/* Custom File Upload Button */}
        <div className="upload-button-container">
          <label htmlFor="profile-picture" className="btn btn-primary upload-button">
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
          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        
        {message && <p className={`mt-3 ${message.startsWith("✅") ? "text-success" : "text-danger"}`}>{message}</p>}
        
        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;