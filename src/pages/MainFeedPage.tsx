import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import "../styles/mainfeed.css";
import { fetchMotivationalQuote, Quote } from "../services/quote-service";


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
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteFetched, setQuoteFetched] = useState(false); // ✅ Prevent multiple requests

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const postResponse = await apiClient.get("/posts");
        setPosts(postResponse.data);

        // ✅ Fetch quote only if it hasn't been fetched already
        if (!quoteFetched) {
          const fetchedQuote = await fetchMotivationalQuote();
          setQuote(fetchedQuote);
          setQuoteFetched(true); // ✅ Prevent multiple fetches
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [quoteFetched]);

  return (
    <div className="main-feed-container">
      <h2 className="main-feed-title">Main Feed</h2>
      {/* 🔹 Display Motivational Quote */}
      {quote && (
        <div className="quote-box">
          <p className="quote-text">“{quote.q}”</p>
          <p className="quote-author">- {quote.a}</p>
        </div>
      )}
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
                  src={post.imageUrl.startsWith("http") ? post.imageUrl : `${apiClient}${post.imageUrl}`} 
                  alt="Post" className="post-image" 
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