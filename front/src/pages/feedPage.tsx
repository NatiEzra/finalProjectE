import React, { useEffect, useState,useRef, useCallback } from "react";
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);


  const observer = useRef<IntersectionObserver | null>(null);


  const fetchPosts = async (pageNumber: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/posts?page=${pageNumber}&limit=10`);
      const data = await response.json();
      if (data.length === 0) {
        setHasMore(false); // No more posts to load
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]); // Append new posts
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }finally{
      setLoading(false);
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

  useEffect(() => {
    fetchPosts(page);
    fetchUsers();
  }, []);

  const getUserInfo = (SenderId: string) => {
    return users.find((user) =>  user._id=== SenderId);
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(page);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  

  return (
    <div className="feed-wrapper">    
      <div className="feed-container">
        <h2 className="feed-title">Feed</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts available</p>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} className="post-card" ref={index === posts.length - 1 ? lastPostRef : null}>
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

        {loading && <p>Loading more posts...</p>}
      </div>
    </div>
  );
};

export default FeedPage;
