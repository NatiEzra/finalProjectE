import React, { useState } from "react";
import { Link } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../css/loginPage.css";




const LoginPage: React.FC = () => {

  const [formData, setFormData] = useState({
      email: "",
      password: "",
    });


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      try{
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials : 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });
        const result = await response.json();
        console.log("Server Response:", result);
        if (response.ok) {
          alert("Login successful!");
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('email', result.email);
          localStorage.setItem('name', result.name);
          localStorage.setItem('image', result.image);
          localStorage.setItem('id', result._id);
          localStorage.setItem('provider', 'local');
          window.location.href = "/home";
        } else {
          alert("Login failed: " + result.message);
        }

      }catch{
        console.error("Error");
        alert("Login failed");

      }
  
  };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="songify-logo">Songify</h1>
          <h2 className="login-title">Login to Songify</h2>
          <form onSubmit={handleSubmit}>

          <input type="email" 
          name="email"
          placeholder="Email" 
          className="login-input" 
          value={formData.email} 
          onChange={handleChange}
          required/>

          <input type="password" 
          name="password"
          placeholder="Password" 
          className="login-input" 
          value={formData.password} 
          onChange={handleChange}/>
  
          <button className="login-button" type="submit">Login</button>
          </form>
          <GoogleLoginButton />
  
          <div className="separator">
            <div className="line"></div>
            <span className="or-text">or</span>
            <div className="line"></div>
          </div>
          <Link to="/register" className="register-link">Register</Link>
          
        </div>
      </div>
    );
  };
  
  export default LoginPage;