import React from "react";
import { useNavigate,Link } from "react-router-dom";
import "../css/loginPage.css";
import Register from "./registerPage";

const LoginPage: React.FC = () => {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="songify-logo">Songify</h1>
          <h2 className="login-title">Login to Songify</h2>
  
          <input type="text" placeholder="Email" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />
  
          <button className="login-button">Login</button>
  
          <a href="#" className="forgot-password">Forgot password?</a>
  
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