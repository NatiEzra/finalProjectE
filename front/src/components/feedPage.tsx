import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/feedPage.css";

interface Post {
  id: string;
  user: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

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

    fetchPosts();
  }, []);

  return (
    <div className="feed-wrapper">
      <nav className="navbar">
        <h1 className="songify-logo">Songify</h1>
        <div className="nav-links">
          <Link to="/home" className="nav-button">Feed</Link>
          <Link to="/my-posts" className="nav-button">My Posts</Link>
          <button className="logout-button">Logout</button>
        </div>
      </nav>

      <div className="feed-container">
        <h2 className="feed-title">Feed</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts available</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3 className="post-user">{post.user}</h3>
              <p className="post-content">{post.content}</p>
              {post.image && <img src={post.image} alt="Post" className="post-image" />}
              <div className="post-actions">
                <span>👍 {post.likes} Likes</span>
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
