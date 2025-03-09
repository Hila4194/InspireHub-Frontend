import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import usePosts from "../hooks/usePosts"; // ✅ Use custom hook
import apiClient from "../services/api-client";
import "../styles/dashboard.css";

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext is null");

  const { user, logout } = authContext;
  const { posts, setPosts, isLoading, error } = usePosts(); // ✅ Use filtered posts
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // ✅ Ensure profile picture is correctly formatted
  const profilePictureUrl = user?.profilePicture?.startsWith("http")
  ? user.profilePicture
  : `http://localhost:4040/uploads/${user?.profilePicture}`;

  console.log("🔍 Profile Picture URL:", profilePictureUrl);

  // ✅ Create a new post
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("❌ Title and content are required.");
      return;
    }

    if (!user) { // ✅ Ensure user is logged in
      console.error("❌ Error: User is not logged in");
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      const res = await apiClient.post("/posts",
        { title, content, sender: user._id },
        { headers: { Authorization: `JWT ${user.accessToken}` } }
      );
      setPosts([res.data, ...posts]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
    }
  };

  // ✅ Delete a post
  const deletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiClient.delete(`/posts/${postId}`, {
        headers: { Authorization: `JWT ${user?.accessToken}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("❌ Error deleting post:", error);
    }
  };

  // ✅ Edit a Post
  const editPost = async (postId: string) => {
    const newTitle = prompt("Enter new title:");
    const newContent = prompt("Enter new content:");
    if (!newTitle || !newContent) return;

    try {
      const res = await apiClient.put(
        `/posts/${postId}`,
        { title: newTitle, content: newContent, sender: user?._id },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (error) {
      console.error("❌ Error updating post:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* ✅ User Profile Info */}
      <div className="dashboard-header">
      <div className="profile-info">
          {/* ✅ Ensure the profile picture displays correctly */}
          {user?.profilePicture && (
            <img src={user.profilePicture} alt="Profile" className="profile-img" />
          )}
          <h3>Welcome, {user?.username}!</h3>
        </div>
        <button onClick={logout} className="btn btn-danger">Logout</button>
      </div>

      {/* ✅ Create Post */}
      <div className="create-post-card">
        <h3>Create a New Post</h3>
        <form onSubmit={createPost}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control mb-2"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control mb-2"
          />
          <button type="submit" className="btn btn-success w-100">Create Post</button>
        </form>
      </div>

      {/* ✅ Display Posts */}
      <h3 className="mt-4">Your Posts</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <h5>{post.title}</h5>
              <p>{post.content}</p>
              {/* ✅ Action Buttons */}
              <div className="post-actions">
                <button className="btn btn-warning btn-sm" onClick={() => editPost(post._id)}>✏ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deletePost(post._id)}>🗑 Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )
      )}
    </div>
  );
};

export default Dashboard;