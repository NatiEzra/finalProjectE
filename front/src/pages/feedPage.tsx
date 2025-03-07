import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/feedPage.css";

interface Post {
  id: string;
  SenderId: string;
  title: string;
  content: string;
  image?: string;
  userLikes: Array<string>;
  comments: number;
}

interface User{
  _id: string;
  name: string;
  email: string;
  image: string;
}
const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3000/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/getAllUsers");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchPosts();
    fetchUsers();
  }, []);

  const getUserInfo = (SenderId: string) => {
    return users.find((user) =>  user._id=== SenderId);
  };

  return (
    <div className="feed-wrapper">    
      <div className="feed-container">
        <h2 className="feed-title">Feed</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts available</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
              {getUserInfo(post.SenderId)?.image && (
              <img src={`http://localhost:3000/${getUserInfo(post.SenderId)?.image}`} alt="User" className="user-avatar" />
              )}
              <h3 className="post-user">{getUserInfo(post.SenderId)?.name || "Unknown User"}</h3>
               </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              {post.image && <img src={`http://localhost:3000/${post.image}`} alt="Post" className="post-image" />}
              <div className="post-actions">
                <span>👍 {post.userLikes.length} Likes</span>
                <span>💬 {post.comments} Comments</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;
