import React from "react";
import "../css/myProfile.css";



const userId = localStorage.getItem("id");
const token = localStorage.getItem("accessToken"); 
const  email = localStorage.getItem("email");
const  name = localStorage.getItem("name");
const  image = localStorage.getItem("image");
const provider = localStorage.getItem("provider"); 

const MyProfile: React.FC = () => {
    //const imageUrl = provider === "google" ? image ?? "" : `${import.meta.env.SERVER_URL}/${image ?? ""}`;
    var imageUrl = "";
    if(provider === "google" && image){
        imageUrl = image;
    }
    else{
        imageUrl = `http://localhost:3000/${image}`;
       // imageUrl= `${import.meta.env.SERVER_URL}/${image}`;
    }

    return (
        <div className="profile-container">
            <h2 className="profile-title">Profile</h2>
            <div className="profile-card">
                <img src={imageUrl} alt="" className="profile-image" />
                <h3 className="profile-name">{name}</h3>
                <p className="profile-email">{email}</p>
            </div>
        </div>
    )
}

export default MyProfile;