import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/createPost.css";
import { refreshAccessToken } from "../util/auth";

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
    const postDataToSend = new FormData();
    postDataToSend.append("title", postData.title);
    postDataToSend.append("content", postData.content);
    if (userId) {
      postDataToSend.append("SenderId", userId);
    } else {
      alert("User not found! Please log in.");
      return;
    }
      const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
      postDataToSend.append("image", fileInput.files[0]); 
      }
    

    try {
      var response = await fetch("http://localhost:3000/posts/", {
        method: "POST",
        headers: {
          Authorization: `JWT ${token}`,
        },
        body: postDataToSend,
      });
      if (response.status === 401) {
            console.warn("Access token expired. Refreshing..."); 
            const refreshSuccess = await refreshAccessToken();
            const token = localStorage.getItem("accessToken");
            response = await fetch("http://localhost:3000/posts/", {
              method: "POST",
              headers: {
                Authorization: `JWT ${token}`,
              },
              body: postDataToSend,
              });
                      
            }

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
        <input type="file" accept="image/*" className="post-input" />
        <button type="submit" className="submit-button">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostPage;
