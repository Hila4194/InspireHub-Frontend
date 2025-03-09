import { FC, useState } from "react";
import usePosts from "../hooks/usePosts";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api-client";

const PostsList: FC = () => {
  const { posts, setPosts, isLoading, error } = usePosts();
  const { user } = useAuth();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // ✅ DELETE Post
  const deletePost = async (postId: string) => {
    try {
      await apiClient.delete(`/posts/${postId}`, {
        headers: { Authorization: `JWT ${user?.accessToken}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("❌ Error deleting post:", error);
    }
  };

  // ✅ EDIT Post
  const editPost = (postId: string, title: string, content: string) => {
    setEditingPostId(postId);
    setEditedTitle(title);
    setEditedContent(content);
  };

  const savePost = async (postId: string) => {
    try {
      await apiClient.put(
        `/posts/${postId}`,
        { title: editedTitle, content: editedContent },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId ? { ...post, title: editedTitle, content: editedContent } : post
        )
      );
      setEditingPostId(null);
    } catch (error) {
      console.error("❌ Error updating post:", error);
    }
  };

  // ✅ LIKE Post
  const likePost = async (postId: string) => {
    try {
      await apiClient.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
      setPosts(posts.map(post => post._id === postId ? { ...post, likes: post.likes + 1 } : post));
    } catch (error) {
      console.error("❌ Error liking post:", error);
    }
  };

  return (
    <div className="posts-container">
      {isLoading && <p className="loading">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {posts.length === 0 ? (
        <p>No posts yet. Start creating one!</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post-card">
            {/* ✅ Show User Profile Picture */}
            <div className="post-header">
              <img src={user?.profilePicture} alt="Profile" className="profile-pic" />
              <span>{user?.username}</span>
            </div>

            {editingPostId === post._id ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="form-control"
                />
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="form-control"
                />
                <button onClick={() => savePost(post._id)} className="btn btn-success">✔ Save</button>
                <button onClick={() => setEditingPostId(null)} className="btn btn-secondary">✖ Cancel</button>
              </>
            ) : (
              <>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <p>❤️ {post.likes} Likes</p>

                {/* ✅ Action Buttons (Edit, Delete, Like) */}
                <div className="post-actions">
                  {/* ✅ Edit & Delete only if user is the owner */}
                  {post.sender === user?._id && (
                    <>
                      <button onClick={() => editPost(post._id, post.title, post.content)} className="btn btn-warning">
                        📝 Edit
                      </button>
                      <button onClick={() => deletePost(post._id)} className="btn btn-danger">
                        ❌ Delete
                      </button>
                    </>
                  )}

                  {/* ✅ Like Post */}
                  <button onClick={() => likePost(post._id)} className="btn btn-primary">
                    ❤️ Like
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostsList;