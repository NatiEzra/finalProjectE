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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("User Registered:", formData);
    // Add API call logic here
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