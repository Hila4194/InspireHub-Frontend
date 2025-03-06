import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import "../styles/dashboard.css";

interface Post {
  _id: string;
  title: string;
  content: string;
}

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext)!;
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get<Post[]>("http://localhost:5000/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/posts",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([res.data, ...posts]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
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

      <h3 className="mt-4">Recent Posts</h3>
      <div className="row">
        {posts.map((post) => (
          <div key={post._id} className="col-md-6">
            <div className="post-card">
              <h5>{post.title}</h5>
              <p>{post.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;