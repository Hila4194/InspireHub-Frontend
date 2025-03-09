import React, { useContext, useState } from "react";
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

  if (!user) {
    navigate("/login");
  }

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("❌ Title and content are required.");
      return;
    }
  
    if (!user) {  // ✅ Ensure user is logged in before making the request
      console.error("❌ Error: User is not logged in");
      alert("You must be logged in to create a post.");
      return;
    }
  
    try {
      const res = await apiClient.post("/posts",
        { title, content, sender: user._id }, // ✅ Send user ID
        { headers: { Authorization: `JWT ${user.accessToken}` } }
      );
      setPosts([res.data, ...posts]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
    }
  };  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button onClick={logout} className="btn btn-danger">Logout</button>
      </div>

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