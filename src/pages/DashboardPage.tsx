import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../services/api-client";
import PostsList from "../components/PostsList";
import "../styles/dashboard.css";

interface Post {
  _id: string;
  title: string;
  content: string;
}

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext is null");

  const { user, logout } = authContext;
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get<Post[]>("/posts", {
        headers: { Authorization: `JWT ${user?.accessToken}` }, // 🔹 Ensure JWT authentication
      });
      setPosts(res.data);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("❌ Title and content are required.");
      return;
    }
    try {
      const res = await apiClient.post(
        "/api/posts",
        { title, content },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
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

      {/* 🔹 Create a New Post */}
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

      {/* 🔹 Display Recent Posts */}
      <h3 className="mt-4">Recent Posts</h3>
      <PostsList />

    </div>
  );
};

export default Dashboard;