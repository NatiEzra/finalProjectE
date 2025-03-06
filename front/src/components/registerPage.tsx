import React, { useState } from "react";
import '../css/registerPage.css';
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("name", formData.name);
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
    formDataToSend.append("image", fileInput.files[0]); 
    }
    


    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        body: formDataToSend,
      });
      
  
      const result = await response.json();
      console.log("Server Response:", result);
      
  
      if (response.ok) {
        alert("Registration successful!");
      } else {
        alert("Registration failed: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
    
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-logo">Songify</h1>
        <h2 className="register-title">Create a new account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            minLength={2}
            placeholder="Full Name"
            className="register-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="register-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            minLength={4}
            placeholder="Password"
            className="register-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input type="file" accept="image/*" className="register-input" />

          <button type="submit" className="register-button">Sign Up</button>
        </form>
        
       <Link  to="/login" className="login-link">Already have an acount?</Link>
      </div>
    </div>
  );
};

export default Register;