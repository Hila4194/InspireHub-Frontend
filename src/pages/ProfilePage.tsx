import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || "");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);

            if (user.profilePicture && !user.profilePicture.startsWith("http")) {
                setPreviewImage(`${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}`);
            } else {
                setPreviewImage(user.profilePicture);
            }
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
    
        try {
            if (profilePicture) {
                // ✅ Send FormData if a new profile picture is selected
                const formData = new FormData();
                formData.append("username", username);
                formData.append("email", email);
                formData.append("profilePicture", profilePicture);
    
            } else {
                // ✅ Send JSON if no new profile picture
                await updateProfile({ username, email });
            }
    
            setMessage("✅ Profile updated successfully!");
        } catch {
            setMessage("❌ Failed to update profile.");
        }
    };    

    return (
        <div className="profile-container">
            <h2>Profile</h2>

            <div className="profile-picture-container">
                {previewImage && <img src={previewImage} alt="Profile" className="profile-picture" />}
            </div>

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

            <form onSubmit={handleUpdate} className="profile-form">
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        readOnly
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value="********"
                        readOnly
                    />
                </div>

                <button type="submit" className="btn btn-success w-100">Update Profile</button>
            </form>

            {message && <p className="mt-3 text-success">{message}</p>}
        </div>
    );
};

export default ProfilePage;