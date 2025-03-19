import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/api-client";
import { AuthContext } from "../context/AuthContext";
import "../styles/comments.css";

interface Comment {
  _id: string;
  content: string;
  sender: { _id: string; username: string };
}

interface Post {
  _id: string;
  title: string;
}

const CommentsPage = () => {
  const { user } = useContext(AuthContext) || { user: null };
  const { postId } = useParams(); // Get the post ID from URL
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string>("");
  const [editContent, setEditContent] = useState("");

  // Fetch post title & comments
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Fetch post title
        const postResponse = await apiClient.get<Post>(`/posts/${postId}`);
        setPostTitle(postResponse.data.title);

        // Fetch comments for the post
        const commentsResponse = await apiClient.get<Comment[]>(`/comments/post/${postId}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("❌ Error fetching post or comments:", error);
      }
    };
    fetchPostData();
  }, [postId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Please enter a comment!");
    try {
        const response = await apiClient.post("/comments", {
            content: newComment,
            postId,
          }, {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
          });
          
          // Ensure the new comment has a sender object
          const newCommentData = {
            ...response.data,
            sender: { _id: user?._id, username: user?.username }
          };
          
          setComments([...comments, newCommentData]);
          setNewComment("");       
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  // Enable edit mode
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  // Save edited comment
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return alert("Comment cannot be empty!");
    try {
      await apiClient.put(`/comments/${editingCommentId}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });

      setComments(comments.map(c => (c._id === editingCommentId ? { ...c, content: editContent } : c)));
      setEditingCommentId(null);
    } catch (error) {
      console.error("❌ Error editing comment:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await apiClient.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
    }
  };

  return (
    <div className="comments-container">
      <h2>Comments on post: {postTitle || "Loading..."}</h2>
      <div className="comments-list">
        {comments.length === 0 ? <p>No comments yet.</p> : comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <strong>{comment.sender.username}</strong>:  
            {editingCommentId === comment._id ? (
  <>
    <input type="text" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
    <button onClick={handleSaveEdit}>Save</button>
    <button onClick={() => setEditingCommentId(null)}>Cancel</button>
  </>
) : (
  <>
    <span>{comment.content}</span>
    {comment.sender._id === user?._id && editingCommentId === null && (
      <>
        <button onClick={() => startEditing(comment)}>✏ Edit</button>
        <button onClick={() => handleDeleteComment(comment._id)}>❌ Delete</button>
      </>
    )}
  </>
)}
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleAddComment}>Post</button>
      </div>
    </div>
  );
};

export default CommentsPage;