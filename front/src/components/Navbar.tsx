import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/navbar.css";
import { handleAuthLogout } from "../util/auth";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    handleAuthLogout();
    navigate("/login");
  };

  return (
    <nav className="custom-navbar">
      <h1 className="songify-logo25">Songify</h1>
      <div className="nav-links">
      <Link to="/profile" className="nav-button">Profile</Link>
        <Link to="/forYou" className="nav-button">For You</Link>
        <Link to="/home" className="nav-button">Feed</Link>
        <Link to="/myPosts" className="nav-button">My Posts</Link>
        <Link to="/createPost" className="nav-button">Create Post</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
