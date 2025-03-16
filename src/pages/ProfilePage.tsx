import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api-client";
import "../styles/profile.css";
import { useNavigate } from "react-router-dom";
import { User } from "../context/AuthContext";
import avatar from "../assets/default-avatar.png";
import { z } from "zod"; // ✅ Import Zod for validation

// ✅ Zod Schema for Username Validation (Email & Password Locked)
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: "Username must contain both letters and numbers",
    }),
});

const ProfilePage: React.FC = () => {
    const { user, setUser, logout } = useAuth();
    const [username, setUsername] = useState(user?.username || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || avatar);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<{ username?: string }>({}); // ✅ Error state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!user) return;
                const response = await apiClient.get(`/auth/get-user/${user?._id}`, {
                    headers: { Authorization: `JWT ${user.accessToken}` },
                });

                const latestUser = response.data;
                setUser(latestUser);

                if (latestUser.profilePicture && latestUser.profilePicture.startsWith("http")) {
                    setPreviewImage(latestUser.profilePicture);
                } else {
                    setPreviewImage(`${apiClient.defaults.baseURL}${latestUser.profilePicture}`);
                }
            } catch (error) {
                console.error("❌ Failed to fetch latest user data:", error);
            }
        };

        fetchUser();
    }, [user, setUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // ✅ Validate the username only (email & password are locked)
    const validateUsername = () => {
        const result = usernameSchema.safeParse({ username });
        if (!result.success) {
            const newErrors: { username?: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0] === "username") newErrors.username = err.message;
            });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleUpdate = async () => {
        if (!user) return;

        if (!validateUsername()) {
            setMessage("❌ Fix the errors before updating.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", username);
            if (profilePicture) {
                formData.append("profilePicture", profilePicture);
            }

            const response = await apiClient.put(`/auth/update-profile/${user._id}`, formData, {
                headers: { Authorization: `JWT ${user.accessToken}` },
            });

            const updatedUser: User = response.data;

            if (username !== user.username) {
                setMessage("✅ Username updated! Logging out...");
                setTimeout(() => {
                    logout();
                    navigate("/login");
                }, 2000);
            } else {
                setMessage("✅ Profile updated successfully!");
            }

            setUser(updatedUser);
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            setMessage("❌ Failed to update profile.");
        }
    };

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            <div className="profile-picture-container">
                <img
                    src={previewImage}
                    alt="Profile"
                    className="profile-picture"
                    onError={(e) => { e.currentTarget.src = avatar; }}
                />
                <div className="upload-button-container">
                    <label htmlFor="profile-picture" className="btn btn-primary upload-button">
                        📤 Change Profile Picture
                    </label>
                    <input
                        type="file"
                        id="profile-picture"
                        className="d-none"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
            </div>
            <div className="profile-details">
                <label>Username</label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className={errors.username ? "error-input" : ""}
                />
                {errors.username && <p className="error-message text-danger">{errors.username}</p>} {/* ✅ Text in red */}

                <label>Email</label>
                <input type="email" value={user?.email} disabled className="locked-input" /> {/* 🔒 Locked Field */}

                <label>Password</label>
                <input type="password" value="********" disabled className="locked-input" /> {/* 🔒 Locked Field */}
            </div>
            <button type="submit" className="save-button" onClick={handleUpdate}>Update Profile</button>
            
            {message && (
                <p className={`mt-3 ${message.includes("✅") ? "text-success" : "text-danger"}`}>
                    {message}
                </p>
            )} {/* ✅ Now green for success messages */}
        </div>
    );
};

export default ProfilePage;