import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Comment {
  _id: string;
  postId: string;
  content: string;
  userId: string;
}

interface User {
  _id: string;
  name: string;
  image: string;
}

interface Post {
  _id: string;
  SenderId: string;
  title: string;
  content: string;
  image?: string;
  userLikes: Array<string>;
  date: Date;
}

const CommentsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  // Fetch the post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`,{
            method: 'GET'
        });
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:3000/comments/post/${postId}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/getAllUsers");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Function to get user info by userId
  const getUserInfo = (userId: string) => users.find(user => user._id === userId);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("id");
    
    if (!token || !userId) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/comments/create`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: newComment,
          userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setComments([...comments, result]); // Append new comment
        setNewComment(""); // Clear input
      } else {
        alert("Failed to add comment: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("A network error occurred. Please try again.");
    }
  };
  if(!post) return <p>Loading...</p>;
  const postSender = users.find(user => user._id === post.SenderId);
  return (
    <div className="comments-container">
      {post && (
        <div className="post-card">
            <div className="post-header">
                {postSender?.image ? (
                    <img src={`http://localhost:3000/${postSender.image}`} alt="User" className="user-avatar" />
                ) : (
                    <img src="http://localhost:3000/images/default-avatar.png" alt="Default Avatar" className="user-avatar" />
                )}
                <strong>{postSender?.name || "Unknown User"}</strong>

            </div>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {post.image && <img src={`http://localhost:3000/${post.image}`} alt="Post" className="post-image" />}
          <p className="post-date">Posted on {new Date(post.date).toLocaleString()}</p>
        </div>
      )}

      <h2>Comments</h2>
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => {
            const user = getUserInfo(comment.userId);

            return (
              <li key={comment._id} className="comment-item">
                <div className="comment-header">
                  {user?.image ? (
                    <img src={`http://localhost:3000/${user.image}`} alt="User" className="user-avatar" />
                  ) : (
                    <img src="http://localhost:3000/images/default-avatar.png" alt="Default Avatar" className="user-avatar" />
                  )}
                  <strong>{user?.name || "Unknown User"}</strong>
                </div>
                <p>{comment.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      {/* Comment Input */}
      <div className="comment-input">
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default CommentsPage;
