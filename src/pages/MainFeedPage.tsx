import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import "../styles/mainfeed.css"; // ✅ New CSS file for styling

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sender: { username: string };
}

const MainFeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get("/posts"); // ✅ Fetch all posts
        setPosts(response.data);
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="main-feed-container">
      <h2 className="main-feed-title">Main Feed</h2>

      {loading ? (
        <p className="loading-text">Loading posts...</p>
      ) : (
        <div className="post-grid">
          {posts.length === 0 ? (
            <p className="no-posts-message">No posts available yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-owner">By: {post.sender?.username || "Unknown"}</p>
                {post.imageUrl ? (
                    <img 
                        src={post.imageUrl ? `${apiClient.defaults.baseURL}${post.imageUrl}` : ""} 
                        alt={post.title} 
                        className="post-image"
                    />
                ) : (
                 <p className="post-content">{post.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MainFeedPage;