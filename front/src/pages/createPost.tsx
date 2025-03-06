import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/createPost.css";

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [postData, setPostData] = useState({
    title: "",
    content: "",
  });

  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("accessToken"); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User not found! Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          SenderId: userId,
          userLikes: [],
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Post created successfully!");
        navigate("/home"); // מעבר חזרה לפיד
      } else {
        alert("Failed to create post: " + result.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit} className="create-post-form">
        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={postData.title}
          onChange={handleChange}
          required
          className="post-input"
        />
        <textarea
          name="content"
          placeholder="Write something..."
          value={postData.content}
          onChange={handleChange}
          required
          className="post-textarea"
        />
        <button type="submit" className="submit-button">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostPage;
