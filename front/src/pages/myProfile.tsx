import React from "react";
import "../css/myProfile.css";



const userId = localStorage.getItem("id");
const token = localStorage.getItem("accessToken"); 
const  email = localStorage.getItem("email");
const  name = localStorage.getItem("name");
const  image = localStorage.getItem("image");


const MyProfile: React.FC = () => {

    return (
        <div className="profile-container">
            <h2 className="profile-title">Profile</h2>
            <div className="profile-card">
                <img src={`http://localhost:3000/${image}`} alt=""  className="profile-image" />
                <h3 className="profile-name">{name}</h3>
                <p className="profile-email">{email}</p>
            </div>
        </div>
    )
}

export default MyProfile;