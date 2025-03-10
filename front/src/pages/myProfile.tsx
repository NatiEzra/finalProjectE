import React, { useState, useEffect } from "react";
import "../css/myProfile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const userId = localStorage.getItem("id");
const token = localStorage.getItem("accessToken");
const email = localStorage.getItem("email");
const provider = localStorage.getItem("provider");

const MyProfile: React.FC = () => {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
const imageUrl2=localStorage.getItem("image");
var initialImageUrl="";
if(imageUrl2==null){
    initialImageUrl="";
}
else{
if(imageUrl2.startsWith("http")){
    initialImageUrl=imageUrl2;
}
else{
    initialImageUrl=`http://localhost:3000/${imageUrl2}`;
} 
}
  // קביעת ה- imageUrl בהתאם ל-provider
//   const initialImageUrl =
//     provider === "google"
//       ? localStorage.getItem("image") || ""
//       : `http://localhost:3000/${localStorage.getItem("image") || ""}`;

  const [imagePreview, setImagePreview] = useState(initialImageUrl);

  useEffect(() => {
    // עדכון התצוגה רק אם לא נבחרה תמונה חדשה
    if (!imageFile) {
      setImagePreview(initialImageUrl);
    }
  }, [initialImageUrl, imageFile]);

  const handleSaveChanges = async () => {
    localStorage.setItem("name", name);

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    if (userId) {
      formDataToSend.append("_id", userId);
    }
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const response = await fetch(`http://localhost:3000/auth/edit`, {
        method: "PUT",
        headers: {
          Authorization: `JWT ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");

        if (result.image) {
          localStorage.setItem("image", result.image);
          setImagePreview(`http://localhost:3000/${result.image}`);
        }
      } else {
        alert("Update failed: " + result.message);
      }
    } catch {
      console.error("Error");
      alert("Update failed");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile</h2>
      <div className="profile-card">
        <div className="profile-image-wrapper">
          <img src={imagePreview} alt="Profile" className="profile-image" />
          <button
            className="btn btn-light edit-btn"
            data-bs-toggle="modal"
            data-bs-target="#editProfileModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil-square"
              viewBox="0 0 16 16"
            >
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path
                fillRule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
              />
            </svg>
          </button>
        </div>
        <h3 className="profile-name">{name}</h3>
        <p className="profile-email">{email}</p>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="editProfileModal"
        tabIndex={-1}
        aria-labelledby="editProfileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editProfileModalLabel">
                Edit Profile
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveChanges}
                data-bs-dismiss="modal"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
