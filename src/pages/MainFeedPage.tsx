import { useEffect, useState, useContext } from "react";
import apiClient from "../services/api-client";
import "../styles/mainfeed.css";
import { fetchMotivationalQuote, Quote } from "../services/quote-service";
import { toggleLikePost } from "../services/post-service";
import { AuthContext } from "../context/AuthContext";
import avatar from "../assets/default-avatar.png";
import { CSSTransition, TransitionGroup } from "react-transition-group";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sender: {
    username: string;
    profilePicture?: string;
  };
  likes: number;
  likedByUser?: boolean;
  comments: { _id: string; content: string; sender: { username: string } }[];
}

const PAGE_SIZE = 4;

// This component fetches and displays a list of posts, allowing users to like and comment on them
const MainFeedPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext is null");
  const { user } = authContext;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteFetched, setQuoteFetched] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const postResponse = await apiClient.get<Post[]>(`/posts?limit=${PAGE_SIZE}&skip=${(page - 1) * PAGE_SIZE}`);
        const posts = postResponse.data;

        const backend_url = 'https://node42.cs.colman.ac.il';
        // Keep `VITE_API_BASE_URL` for API calls, but remove `/api` for images
        const apiBaseUrl = backend_url?.trim().replace(/\/$/, ""); // Keep `/api` for API calls
        //const imageBaseUrl = apiBaseUrl.replace("/api", ""); // Remove `/api` for images

        // Ensure correct profile picture & post image formatting
        const formattedPosts = posts.map((post: Post) => ({
          ...post,
          imageUrl: post.imageUrl?.startsWith("/uploads/")
            ? `${apiBaseUrl}${post.imageUrl}`
            : post.imageUrl,
          sender: {
            ...post.sender,
            profilePicture: post.sender.profilePicture?.startsWith("/uploads/")
              ? `${apiBaseUrl}${post.sender.profilePicture}`
              : post.sender.profilePicture || avatar, // Use default avatar
          },
        }));

        setPosts(formattedPosts);
        setHasMore(posts.length === PAGE_SIZE);

        if (!quoteFetched) {
          const fetchedQuote = await fetchMotivationalQuote();
          setQuote(fetchedQuote);
          setQuoteFetched(true);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [page, quoteFetched]);

  // Handle Like/Unlike Post
  const handleLike = async (postId: string) => {
    if (!user) {
      console.error("❌ User not logged in.");
      return;
    }

    try {
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: post.likedByUser ? post.likes - 1 : post.likes + 1, likedByUser: !post.likedByUser }
          : post
      ));

      const response = await toggleLikePost(postId, user.accessToken);

      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: response.likes, likedByUser: response.liked }
          : post
      ));
    } catch (error) {
      console.error("❌ Error toggling like:", error);
    }
  };

  // Open Comments Popup
  const openCommentsPopup = (post: Post) => {
    setSelectedPost(post);
  };

  // Close Comments Popup
  const closeCommentsPopup = () => {
    setSelectedPost(null);
    setNewComment("");
  };

  // Handle Adding a Comment (Closes popup after posting)
  const handleAddComment = async () => {
    if (!selectedPost || !user) return;
    if (!newComment.trim()) return alert("Please enter a comment!");

    try {
      const response = await apiClient.post("/comments", {
        content: newComment,
        sender: user._id,
        postId: selectedPost._id
      });

      const newCommentObj = response.data;

      setPosts(posts.map(post =>
        post._id === selectedPost._id
          ? { ...post, comments: [...post.comments, newCommentObj] }
          : post
      ));

      setNewComment("");
      closeCommentsPopup(); // Close popup after posting
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  return (
    <div className="main-feed-container">
      <h2 className="main-feed-title" style={{ color: "white", textDecoration: "underline" }}>Main Feed</h2>

      {quote && (
        <div className="quote-box">
          <p className="quote-text">“{quote.q}”</p>
          <p className="quote-author">- {quote.a}</p>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading posts...</p>
      ) : (
        <TransitionGroup className="post-grid">
          {posts.length === 0 ? (
            <p className="no-posts-message">No posts available yet!</p>
          ) : (
            posts.map((post) => (
              <CSSTransition key={post._id} timeout={500} classNames="fade">
                <div className="post-card">
                  <div className="post-header">
                    <img
                      src={post.sender.profilePicture || avatar}
                      alt="User Profile"
                      className="post-profile-pic"
                      onError={(e) => e.currentTarget.src = avatar}
                    />
                    <span className="post-owner">{post.sender.username || "Unknown"}</span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>

                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="post-image"
                      onError={(e) => e.currentTarget.style.display = "none"}
                    />
                  ) : (
                    <p className="post-content">{post.content}</p>
                  )}

                  <p>❤️ {post.likes} Likes</p>
                  <p>💬 {post.comments.length} Comments</p>

                  <button onClick={() => handleLike(post._id)} className="like-button">
                    {post.likedByUser ? "❤️ Unlike" : "🤍 Like"}
                  </button>
                  <button onClick={() => openCommentsPopup(post)} className="comment-button">💬 Comment</button>
                </div>
              </CSSTransition>
            ))
          )}
        </TransitionGroup>
      )}

      <div className="pagination-buttons">
        <button className="pagination-btn" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          ◀ Previous
        </button>
        <span className="page-number">Page {page}</span>
        <button className="pagination-btn" onClick={() => setPage((prev) => prev + 1)} disabled={!hasMore}>
          Next ▶
        </button>
      </div>

      {selectedPost && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={closeCommentsPopup}>✖</button>
            <h3>Comments on post: "{selectedPost.title}"</h3>

            <div className="comments-list">
              {selectedPost.comments.length > 0 ? (
                selectedPost.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <strong>{comment.sender.username}</strong>: {comment.content}
                  </div>
                ))
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>

            <div className="comment-input-container">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button onClick={handleAddComment} className="btn btn-primary">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainFeedPage;