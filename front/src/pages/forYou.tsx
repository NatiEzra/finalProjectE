import React, { useEffect, useState } from "react";
import "../css/forYou.css";
import { refreshAccessToken } from "../util/auth";

const SongRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const userId = localStorage.getItem("id");
  var token = localStorage.getItem("accessToken");
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        var response = await fetch(`http://localhost:3000/restApi/recommendations/${userId}`,{
            method: "GET",
            headers: {
                Authorization: `JWT ${token}`,
            },
      });
        if (response.status === 401) {
          console.warn("Access token expired. Refreshing...");
      
          const refreshSuccess = await refreshAccessToken();
          token = localStorage.getItem("accessToken");
          response = await fetch(`http://localhost:3000/restApi/recommendations/${userId}`,{
            method: "GET",
            headers: {
                Authorization: `JWT ${token}`,
            },
         });
          
        }
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        alert("Error fetching recommendations. Please try again later.");
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommendations-container">
      <h2>🎵 AI Song Recommendations</h2>

      {recommendations && recommendations.length === 0 ? (
        <p>Add posts to see recommendations.</p>
      ) : (
        <div className="recommendations-list">
          {recommendations && recommendations.map((song, index) => (
            <p key={index} className="recommended-song">{song}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongRecommendations;
