import { useEffect, useState, useContext  } from "react";
import apiClient from "../services/api-client";
import "../styles/mainfeed.css";
import { fetchMotivationalQuote, Quote } from "../services/quote-service";
import { toggleLikePost } from "../services/post-service";
import { AuthContext } from "../context/AuthContext";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sender: { username: string };
  likes: number;
  likedByUser?: boolean;
}

const MainFeedPage = () => {
  const authContext = useContext(AuthContext); // ✅ Get AuthContext
  if (!authContext) throw new Error("AuthContext is null");
  const { user } = authContext; // ✅ Retrieve user from context  

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteFetched, setQuoteFetched] = useState(false); // ✅ Prevent multiple requests

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const postResponse = await apiClient.get<Post[]>("/posts");
        const posts = postResponse.data;

        // ✅ Keep `VITE_API_BASE_URL` for API calls, but remove `/api` for images
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, ""); // Keep `/api` for API calls
        const imageBaseUrl = apiBaseUrl.replace("/api", ""); // ✅ Remove `/api` for images

        // ✅ Debug: Log raw post image URLs before processing
        console.log("🔍 Debug: Raw Post Image URLs from Backend:", posts.map(post => post.imageUrl));

        // ✅ Ensure post images are correctly formatted
        const formattedPosts = posts.map((post: Post) => ({
          ...post,
          imageUrl: post.imageUrl?.startsWith("/uploads/")
            ? `${imageBaseUrl}${post.imageUrl}` // ✅ Use `imageBaseUrl` (without `/api`)
            : post.imageUrl,
        }));

        console.log("✅ Debug: Processed Post Image URLs:", formattedPosts.map(post => post.imageUrl));

        setPosts(formattedPosts);

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

  const handleLike = async (postId: string) => {
    if (!user) {
        console.error("❌ User not logged in.");
        return;
    }

    try {
        // ✅ Optimistically update UI before server response
        setPosts(posts.map(post =>
            post._id === postId
                ? { ...post, likes: post.likedByUser ? post.likes - 1 : post.likes + 1, likedByUser: !post.likedByUser }
                : post
        ));

        // ✅ Send request to backend
        const response = await toggleLikePost(postId, user.accessToken);

        // ✅ Ensure UI reflects actual backend response
        setPosts(posts.map(post =>
            post._id === postId
                ? { ...post, likes: response.likes, likedByUser: response.liked }
                : post
        ));
    } catch (error) {
        console.error("❌ Error toggling like:", error);

        // ✅ Revert UI update if request fails
        setPosts(posts.map(post =>
            post._id === postId
                ? { ...post, likes: post.likedByUser ? post.likes + 1 : post.likes - 1, likedByUser: !post.likedByUser }
                : post
        ));
    }
};

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
                {/* ✅ Fix Post Image Handling */}
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="post-image"
                  onError={(e) => {
                    console.error("❌ Image failed to load:", e.currentTarget.src);
                    e.currentTarget.style.display = "none"; // ✅ Hide broken images
                  }}
                />
              ) : (
                <p className="post-content">{post.content}</p>
              )}
                <p>❤️ {post.likes} Likes</p> {/* ✅ Display like count */}
                <button onClick={() => handleLike(post._id)} className="like-button">
                  {post.likedByUser ? "❤️ Unlike" : "🤍 Like"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MainFeedPage;