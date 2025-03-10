import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost, fetchUserPosts } from "../services/post-service"; // ✅ Added fetchUserPosts
import "../styles/dashboard.css";
import apiClient from "../services/api-client";

const Dashboard = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error("AuthContext is null");

    const { user, logout } = authContext;
    interface Post {
        _id: string;
        title: string;
        content?: string;
        imageUrl?: string;
    }
    
    const [userPosts, setUserPosts] = useState<Post[]>([]); // ✅ Holds user's posts
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState<"text" | "image">("text");
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const navigate = useNavigate();

    // ✅ Fetch all user posts on page load
    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {
            fetchUserPosts(user._id).then((posts) => setUserPosts(posts)); // ✅ Load all user posts from DB
        }
    }, [user, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const createPostHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);

        if (!title || (postType === "text" && !content) || (postType === "image" && !image)) {
            setNotification({ message: "❌ Please fill in all required fields.", type: "error" });
            return;
        }

        if (!user || !user.accessToken) {
            setNotification({ message: "❌ You must be logged in to create a post.", type: "error" });
            return;
        }

        try {
            const newPost = await createPost({ title, content, image: image || undefined, token: user.accessToken });
            setUserPosts([newPost, ...userPosts]); // ✅ Add new post to the existing list
            setTitle("");
            setContent("");
            setImage(null);
            setPreviewImage(null);
            setNotification({ message: "✅ Post created successfully!", type: "success" });
        } catch {
            setNotification({ message: "❌ Failed to create post. Please try again.", type: "error" });
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="profile-info">
                    {user?.profilePicture && <img src={user.profilePicture} alt="Profile" className="profile-img" />}
                    <h3>Welcome, {user?.username || "Guest"}!</h3>
                    <p className="dashboard-title">My Dashboard</p>
                </div>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </div>

            {/* ✅ Notification Messages */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="create-post-card">
                <h3>Create a New Post:</h3>

                {/* ✅ Toggle Buttons for Post Type */}
                <div className="post-type-toggle">
                    <button className={postType === "text" ? "active" : ""} onClick={() => setPostType("text")}>📄 Text</button>
                    <button className={postType === "image" ? "active" : ""} onClick={() => setPostType("image")}>🖼 Image</button>
                </div>

                <form onSubmit={createPostHandler}>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control mb-2" required />

                    {postType === "text" && (
                        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="form-control mb-2" required />
                    )}

                    {postType === "image" && (
                        <>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {previewImage && <img src={previewImage} alt="Preview" className="preview-image" />}
                        </>
                    )}

                    <button type="submit" className="btn btn-success w-100">Create Post</button>
                </form>
            </div>

            {/* ✅ User's Posts Section */}
            <div className="user-posts-section">
                <h3>Your Posts:</h3>
                {userPosts && userPosts.length > 0 ? (
    userPosts.map((post) => (
        <div key={post._id} className="post-card">
            <h4>{post.title}</h4>
            {post.imageUrl ? (
                <img src={post.imageUrl.startsWith("http") ? post.imageUrl : `${apiClient.defaults.baseURL}${post.imageUrl}`} 
                     alt="Post" className="post-image" />
            ) : (
                <p>{post.content}</p>
            )}
                </div>
                ))
                ) : (
                    <p>You have not created any posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;