import React, { useCallback, useEffect, useRef, useState } from "react";
import "../css/feedPage.css";

interface Post {
  _id: string;
  SenderId: string;
  title: string;
  content: string;
  image?: string;
  userLikes: Array<string>;
  comments: number;
  date: Date;
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

  const HandleLike = async (postId: string) => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      alert("You must be logged in to like/unlike a post.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/posts/like/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      let result;
      try {
        result = await response.json();
      } catch {
        result = {};
      }
  
      if (response.ok) {
        alert("Post liked successfully!");
        return;
      }
  
      // If user already liked the post, try to unlike
      if (result.message === "user already liked this post") {
        console.log("User already liked, trying to unlike...");
  
        const response2 = await fetch(`http://localhost:3000/posts/unlike/${postId}`, {
          method: "POST",
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        let result2;
        try {
          result2 = await response2.json();
        } catch {
          result2 = {};
        }
  
        if (response2.ok) {
          alert("Post unliked successfully!");
        } else {
          alert("Failed to unlike post: " + (result2.message || "Unknown error"));
        }
  
        return;
      }
  
      alert("Failed to like post: " + (result.message || "Unknown error"));
    } catch (error) {
      console.error("Error:", error);
      alert("A network error occurred. Please try again.");
    }
  };
  
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
              <p className="post-date">{new Date(post.date).toLocaleString()}</p>
              {getUserInfo(post.SenderId)?.image && (
              <img src={`http://localhost:3000/${getUserInfo(post.SenderId)?.image}`} alt="User" className="user-avatar" />
              )}
              <h3 className="post-user">{getUserInfo(post.SenderId)?.name || "Unknown User"}</h3>
               </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              {post.image && <img src={`http://localhost:3000/${post.image}`} alt="Post" className="post-image" />}
              <div className="post-actions">
              <button type="button" className="btn btn-primary" onClick={() => HandleLike(post._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                 <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                </svg>
                    {post.userLikes.length} Likes
                </button>
               

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
