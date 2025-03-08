import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import defaultAvatar from "../assets/default-avatar.png"; // Import default avatar

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

  // Validate Inputs
  const validateInputs = () => {
    const newErrors: { username?: string; email?: string; password?: string } = {};

    // Username validation: must contain letters and numbers
    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(username)) {
      newErrors.username = "Username must contain both letters and numbers";
    }

    // Email validation: must contain @ and follow standard email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation: must be at least 6 characters
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
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
      const response = await axios.post("http://localhost:5000/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
      navigate("/login"); // Redirect to Login Page after successful registration
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Registration failed");
      } else {
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
        {message && <p className="mt-3 text-danger">{message}</p>}
        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;