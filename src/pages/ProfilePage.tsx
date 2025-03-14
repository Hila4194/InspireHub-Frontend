import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Uses user state from context
import apiClient from "../services/api-client";
import "../styles/profile.css";
import { useNavigate } from "react-router-dom";
import { User } from "../context/AuthContext";
import avatar from "../assets/default-avatar.png";

const ProfilePage: React.FC = () => {
    const { user, setUser, logout } = useAuth();
    const [username, setUsername] = useState(user?.username || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || "/assets/default-avatar.png");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // ✅ Use navigation for redirection

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
                    setPreviewImage(latestUser.profilePicture); // ✅ Load the latest image
                } else {
                    setPreviewImage(`${apiClient.defaults.baseURL}${latestUser.profilePicture}`);
                }
            } catch (error) {
                console.error("❌ Failed to fetch latest user data:", error);
            }
        };
    
        fetchUser();
    }, [user, setUser]); // ✅ Runs whenever the user or setUser changes
    
    // ✅ Handle image selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file)); // Show preview
        }
    };

    // ✅ Handle profile update
    const handleUpdate = async () => {
        if (!user) return;
    
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
                    logout(); // ✅ Log the user out
                    navigate("/login"); // ✅ Redirect to login page
                }, 2000); // ⏳ Delay to show success message
            } else {
                setMessage("✅ Profile updated successfully!");
            }
    
            setUser(updatedUser); // ✅ Update user in state
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
                    onError={(e) => {
                        e.currentTarget.src = avatar; // ✅ Fallback to default avatar
                    }}
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
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label>Email</label>
                <input type="email" value={user?.email} disabled />
                <label>Password</label>
                <input type="password" value="********" disabled />
            </div>
            <button type="submit" className="save-button" onClick={handleUpdate}>Update Profile</button>
            {message && <p className="mt-3 text-success">{message}</p>}
        </div>
    );
};

export default ProfilePage;