import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost, fetchUserPosts, updatePost, deletePost } from "../services/post-service";
import "../styles/dashboard.css";
import apiClient from "../services/api-client";
import editIcon from "../assets/edit.png";
import deleteIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.png";
import avatar from "../assets/default-avatar.png";

// This is the Dashboard component that displays the user's dashboard with their posts and allows them to create, edit, and delete posts
// It also provides AI suggestions for post ideas based on user input
// and includes a comments section for each post
// It uses the AuthContext to manage user authentication and profile information
const Dashboard = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error("AuthContext is null");

    const { user, logout } = authContext;

    interface Post {
        _id: string;
        title: string;
        content?: string;
        imageUrl?: string;
        likes: number;
        comments: Comment[];
    }

    interface Comment {
        _id: string;
        content: string;
        sender: { username: string };
    }

    const [userInput, setUserInput] = useState("");  
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState<"text" | "image">("text");
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [postNotification, setPostNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [editedImage, setEditedImage] = useState<File | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.profilePicture || "/default-avatar.png");
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showCommentsPopup, setShowCommentsPopup] = useState(false);
    const [previewImageDimensions, setPreviewImageDimensions] = useState<{ width: number, height: number } | null>(null);
    const [modalTop, setModalTop] = useState<number>(window.scrollY + window.innerHeight / 2 - 100);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    
        if (!user._id) return; // Prevents errors if `user` is not fully loaded
    
        console.log("🔍 Debug: User Profile Picture from Backend:", user.profilePicture);
    
        const fetchData = async () => {
            try {
                const posts = await fetchUserPosts(user._id);

                const backend_url = 'https://node42.cs.colman.ac.il';
                // Keep `VITE_API_BASE_URL` for API calls, but remove `/api` for images
                const apiBaseUrl = backend_url?.trim().replace(/\/$/, ""); // Keep `/api` for API calls
                //const imageBaseUrl = apiBaseUrl.replace("/api", ""); // Remove `/api` for images
        
                // Ensure post images are correctly formatted
                const formattedPosts = posts.map((post: Post) => ({
                    ...post,
                    likes: post.likes ?? 0, // Ensure likes is always a number
                    imageUrl: post.imageUrl?.startsWith("/uploads/")
                        ? `${apiBaseUrl}${post.imageUrl}` // Use `imageBaseUrl` (without `/api`)
                        : post.imageUrl,
                }));
        
                setUserPosts(formattedPosts);
                fetchAISuggestions(); // Fetch AI suggestions after posts are set
                
                let newProfileImage = avatar; // Default fallback

                // Ensure the profile image is set correctly
                if (user.profilePicture) {
                    newProfileImage = user.profilePicture.startsWith("/uploads/")
                        ? `${apiBaseUrl}${user.profilePicture}`
                        : user.profilePicture;
                }

                console.log("✅ Debug: Processed Profile Picture URL:", newProfileImage);
                setProfileImage(newProfileImage);
                
            } catch (error) {
                console.error("❌ Error fetching user posts:", error);
                setUserPosts([]); // Prevent crash if fetching fails
            }
        };
    
        fetchData();
    }, [user]);    

    // Logout Function
    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            logout();
        }
    };
    
    // Image Upload Handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
    
            // Create an offscreen image to get the original size
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                setPreviewImageDimensions({ width: img.width, height: img.height });
            };
        }
    };

    // Fetch comments for selected post
    const handleFetchComments = async (postId: string) => {
        try {
            const response = await apiClient.get(`/comments/post/${postId}`);
            const updatedPosts = userPosts.map((post) =>
                post._id === postId ? { ...post, comments: response.data } : post
            );
            setUserPosts(updatedPosts);
    
            const post = updatedPosts.find((p) => p._id === postId);
            setSelectedPost(post || null);
    
            // Dynamically position modal relative to current scroll
            setModalTop(window.scrollY + window.innerHeight / 2 - 100);
            
            setShowCommentsPopup(true);
        } catch (error) {
            console.error("❌ Error fetching comments:", error);
        }
    };    

    // Create Post Handler
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
    
            const backend_url = 'https://node42.cs.colman.ac.il';
            // Keep `VITE_API_BASE_URL` for API calls, but remove `/api` for images
            const apiBaseUrl = backend_url?.trim().replace(/\/$/, ""); // Keep `/api` for API calls
            //const imageBaseUrl = apiBaseUrl.replace("/api", ""); // Remove `/api` for images
    
            const formattedPost = {
                ...newPost,
                imageUrl: newPost.imageUrl?.startsWith("/uploads/")
                    ? `${apiBaseUrl}${newPost.imageUrl}`
                    : newPost.imageUrl,
            };
    
            setUserPosts([formattedPost, ...userPosts]); // Add new post immediately
            setTitle("");
            setContent("");
            setImage(null);
            setPreviewImage(null);
            setNotification({ message: "✅ Post created successfully!", type: "success" });
        } catch {
            setNotification({ message: "❌ Failed to create post. Please try again.", type: "error" });
        }
    };
    
    // Edit Post Handler
    const handleEditClick = (post: Post) => {
        setEditingPostId(post._id);
        setEditedTitle(post.title);
        setEditedContent(post.content || "");
        setEditedImage(null);
        setPreviewImage(post.imageUrl || null);
    };
    
    // Update Post Handler
    const handleUpdatePost = async (postId: string) => {
        try {
            const formData = new FormData();
            formData.append("title", editedTitle);
            formData.append("content", editedContent);
            if (editedImage) formData.append("file", editedImage); // Upload new image if selected
    
            const updatedPost = await updatePost(postId, formData);
    
            const backend_url = 'https://node42.cs.colman.ac.il';
            // Keep `VITE_API_BASE_URL` for API calls, but remove `/api` for images
            const apiBaseUrl = backend_url?.trim().replace(/\/$/, ""); // Keep `/api` for API calls
            //const imageBaseUrl = apiBaseUrl.replace("/api", ""); // Remove `/api` for images
    
            const formattedUpdatedPost = {
                ...updatedPost,
                imageUrl: updatedPost.imageUrl?.startsWith("/uploads/")
                    ? `${apiBaseUrl}${updatedPost.imageUrl}`
                    : updatedPost.imageUrl,
            };
    
            setUserPosts(userPosts.map((post) => (post._id === postId ? formattedUpdatedPost : post))); // Update post list immediately
            setEditingPostId(null);
            setPreviewImage(null); // Reset preview after saving
            setPostNotification({ message: "✅ Post updated successfully!", type: "success" });
        } catch {
            setPostNotification({ message: "❌ Failed to update post. Please try again.", type: "error" });
        }
    };    

    // Delete Post Handler
    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId);
            setUserPosts(userPosts.filter((post) => post._id !== postId));
            setPostNotification({ message: "✅ Post deleted successfully!", type: "success" });
        } catch {
            setPostNotification({ message: "❌ Failed to delete post. Please try again.", type: "error" });
        }
    };

    // Function to send user input to backend and get AI suggestions
    const fetchAISuggestions = async () => {
        setSubmitted(true);
    
        if (!userInput.trim()) {
            setError("❌ Please enter some text before requesting AI suggestions.");
            return;
        }
    
        setError(null); // Clear error when input is provided
        setLoadingSuggestions(true);
    
        try {
            const response = await apiClient.post("/posts/suggestions", { userInput });
            setAiSuggestions(response.data.suggestions);
        } catch (err) {
            console.error("❌ Error fetching AI suggestions:", err);
            setError("❌ Failed to get suggestions. Please try again.");
        } finally {
            setLoadingSuggestions(false);
        }
    };    

    return (
        <div className="dashboard-container">
            <h2 style={{ color: "white", textDecoration: "underline", textAlign:"center" }}>My Dashboard</h2>
            <div className="dashboard-header">
                <div className="profile-info">
                    {user?.profilePicture && (
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="profile-img"
                            onError={() => setProfileImage(avatar)}
                        />
                    )}
                    <h3>Welcome, {user?.username ? user.username : "User"}!</h3>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>
    
            {/* AI-Based Content Suggestions Section */}
            <div className="ai-suggestions">
                <h3>🤖 Get AI Post Ideas</h3>
                <p>Enter a topic or idea below, and AI will suggest post ideas for you.</p>
    
                <textarea
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        if (submitted) setError(null);
                    }}
                    placeholder="Type your topic or idea here..."
                    className="form-control"
                    rows={3}
                ></textarea>
    
                <button onClick={fetchAISuggestions} className="btn btn-primary mt-2">
                    Generate Post Ideas
                </button>
    
                {submitted && error && <p className="error-text">{error}</p>}
    
                {loadingSuggestions ? (
                    <p>Loading suggestions...</p>
                ) : (
                    aiSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {aiSuggestions.map((suggestion, index) => (
                                <li key={index}>✨ {suggestion}</li>
                            ))}
                        </ul>
                    )
                )}
            </div>
    
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
    
            {/* Create a New Post */}
            <div className="create-post-card">
                <h3>Create a New Post:</h3>
                <div className="post-type-toggle">
                    <button className={postType === "text" ? "active" : ""} onClick={() => setPostType("text")}>📄 Text</button>
                    <button className={postType === "image" ? "active" : ""} onClick={() => setPostType("image")}>🖼 Image</button>
                </div>
    
                <form onSubmit={createPostHandler}>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control mb-2" required />
                    {postType === "text" && <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="form-control mb-2" required />}
                    {postType === "image" && (
                        <>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {previewImage && previewImageDimensions && (
                            <div className="image-preview-container">
                            <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="image-preview"
                            />
                        </div>
                        )}
                        </>
                    )}
                    <button type="submit" className="btn btn-success w-100">Create Post</button>
                </form>
            </div>
    
            {/* User Posts Section */}
                <div className="user-posts-section">
                    <h3>Your Posts:</h3>
                        {/* Display success/error messages here */}
                        {postNotification && (
                        <div className={`notification ${postNotification.type}`}>
                        {postNotification.message}
                    </div>
            )}
    {userPosts.length > 0 ? (
        userPosts.map((post) => (
            <div key={post._id} className="post-card">
                {editingPostId === post._id ? (
                    <>
                        {/* Edit Post Form */}
                        <div className="edit-post-form">
                            <label>Title</label>
                            <input 
                                type="text" 
                                value={editedTitle} 
                                onChange={(e) => setEditedTitle(e.target.value)} 
                            />

                            {/* Content Field (Only for Text Posts) */}
                            {!post.imageUrl && (
                                <>
                                    <label>Content</label>
                                    <textarea 
                                        value={editedContent} 
                                        onChange={(e) => setEditedContent(e.target.value)} 
                                    />
                                </>
                            )}

                            {/* Image Upload (Only for Image Posts) */}
                            {post.imageUrl && (
                                <>
                                    <label>Choose New Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                setEditedImage(file);
                                                setPreviewImage(URL.createObjectURL(file)); // Show preview before saving
                                            }
                                        }} 
                                    />
                                </>
                            )}

                            {/* Show preview before saving */}
                            {previewImage && <img src={previewImage} alt="Preview" className="edit-image-preview" />}
                        </div>

                        {/* Save & Cancel Buttons */}
                        <div className="edit-buttons">
                            <button className="save-btn" onClick={() => handleUpdatePost(post._id)}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingPostId(null)}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h4>{post.title}</h4>
                        {/* Ensure post images load correctly */}
                        {post.imageUrl ? (
                            <img 
                                src={post.imageUrl} 
                                alt="Post" 
                                className="post-image"
                                onLoad={(e) => e.currentTarget.classList.add("loaded")}
                                onError={(e) => {
                                    console.error("❌ Image failed to load:", e.currentTarget.src);
                                    e.currentTarget.style.display = "none"; // Hide broken images
                                }}
                            />
                        ) : (
                            <p>{post.content}</p>
                        )}
                        <p>❤️ {Array.isArray(post.likes) ? post.likes.length : post.likes ?? 0} Likes</p>
                        <p>💬 {post.comments?.length || 0} Comments</p>
                        <div className="post-actions">
                            <button onClick={() => handleEditClick(post)}><img src={editIcon} alt="Edit" /></button>
                            <button onClick={() => handleDeletePost(post._id)}><img src={deleteIcon} alt="Delete" /></button>
                            <button onClick={() => handleFetchComments(post._id)}><img src={commentIcon} alt="View Comments" /></button>
                        </div>
                    </>
                )}
            </div>
        ))
    ) : <p>You have not created any posts yet!</p>}
</div>

            {/* Comments Modal */}
{showCommentsPopup && selectedPost && (
  <div className="comments-modal" style={{ "--modal-top": `${modalTop}px` } as React.CSSProperties}>
    <div className="modal-content">
      {/* Close Button Centered Above */}
      <div className="comments-header">
        <button className="close-btn" onClick={() => setShowCommentsPopup(false)}>✖</button>
      </div>

      {/* Title Below Close Button */}
      <h3 className="comments-title">
        Comments on post: "{selectedPost.title}"
      </h3>

      {selectedPost.comments.length > 0 ? (
        selectedPost.comments.map((comment) => (
          <div key={comment._id} className="comment">
            <strong>{comment.sender.username}:</strong> {comment.content}
          </div>
        ))
      ) : (
        <p>No comments yet!</p>
      )}
    </div>
  </div>
)}
        </div>
    );    
};

export default Dashboard;