import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { refreshAccessToken } from "../util/auth";
import "../css/commentsPage.css";

interface Comment {
  _id: string;
  postId: string;
  content: string;
  userId: string;
  date: Date;
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
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch the post
  useEffect(() => {
    //refreshAccessToken(); // Refresh the token when the page loads.
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  // Fetch comments with pagination
  const fetchComments = async (pageNumber: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const response = await fetch(`http://localhost:3000/comments/post/${postId}?page=${pageNumber}&limit=10`);
      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false); // No more comments to load
      } else {
        setComments((prevComments) => [...prevComments, ...data]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments(1); // Load the first page of comments when component mounts
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
      var response = await fetch(`http://localhost:3000/comments/`, {
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
      if (response.status === 401) {
                console.warn("Access token expired. Refreshing...");
            
                const refreshSuccess = await refreshAccessToken();
                const token = localStorage.getItem("accessToken");
                response = await fetch(`http://localhost:3000/comments/`, {
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
                
      }

      const result = await response.json();
      

      if (response.ok) {
        setComments((prevComments) => [ ...prevComments, result]);
        setNewComment(""); // Clear input
      } else {
        alert("Failed to add comment: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("A network error occurred. Please try again.");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if(!editCommentId || !editCommentContent.trim()) 
      return;
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      alert("You must be logged in to edit a comment.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("content", editCommentContent);
      var response = await fetch(`http://localhost:3000/comments/${commentId}`, {
        method: "PUT",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: editCommentContent
        }),
      });
      if (response.status === 401) {
                console.warn("Access token expired. Refreshing...");
                const refreshSuccess = await refreshAccessToken();
                const token = localStorage.getItem("accessToken");
                response = await fetch(`http://localhost:3000/comments/${commentId}`, {
                  method: "PUT",
                  headers: {
                    Authorization: `JWT ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    content: editCommentContent
                  }),
                });
                
              }

      const result = await response.json();

      if (response.ok) {
        setComments(comments.map((comment) => (comment._id === commentId && editCommentContent !== null ? { ...comment, content: editCommentContent } : comment)));
        setEditCommentId(null);// close the modal
      } else {
        alert("Failed to edit comment: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("A network error occurred. Please try again.");
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to delete a comment.");
      return;
    }
    var response = await fetch(`http://localhost:3000/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    if (response.status === 401) {
      console.warn("Access token expired. Refreshing...");
      const refreshSuccess = await refreshAccessToken();
      const token = localStorage.getItem("accessToken");
      response = await fetch(`http://localhost:3000/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `JWT ${token}`,
        },
      });
      
    }
    if (response.ok) {
      setComments(comments.filter((comment) => comment._id !== commentId));
    } else {
      alert("Failed to delete comment.");
    }
    };

  const observer = useRef<IntersectionObserver | null>(null);

  const lastCommentRef = useCallback(
      (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchComments(page);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, page]
  );

  if (!post) return <p>Loading...</p>;
  const postSender = users.find(user => user._id === post.SenderId);

  return (
    <div className="comments-container">
      {/* Post Display */}
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
  
      {/* New Comment Input */}
      <div className="comment-input">
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
  
      <h2>Comments</h2>
  
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div>
          {comments.map((comment, index) => {
            const user = getUserInfo(comment.userId);
            return (
              <div
                key={comment._id}
                className="comment-item"
                ref={index === comments.length - 1 ? lastCommentRef : null}
              >
                {(localStorage.getItem("id") === comment.userId) && (
                  <div>
                    <button 
                      className="btn btn-light edit-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#editCommentModal"
                      onClick={() => {
                        setEditCommentContent(comment.content);
                        setEditCommentId(comment._id);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger delete-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
                <img
                  src={user?.image ? `http://localhost:3000/${user.image}` : "http://localhost:3000/images/default-avatar.png"}
                  alt="User"
                  className="user-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>{user?.name || "Unknown User"}</strong>
                    <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            );
          })}
          {loadingMore && <p>Loading more comments...</p>}
        </div>
      )}
  
      {/* Edit Comment Modal */}
      <div className="modal fade" id="editCommentModal" tabIndex={-1} aria-labelledby="editCommentModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Comment</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                value={editCommentContent || ""}
                onChange={(e) => setEditCommentContent(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => handleEditComment(editCommentId!)}
                data-bs-dismiss="modal"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CommentsPage;  