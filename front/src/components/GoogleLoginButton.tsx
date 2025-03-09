import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCallbackResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-button"),
          { theme: "outline", size: "large" }
        );
      }
    };
  }, []);

  const handleCallbackResponse = async (response: any) => {
    console.log("Encoded JWT ID Token: " + response.credential);
  
    try {
      // Send the token to your backend for verification
      const res = await fetch("http://localhost:3000/restApi/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent if backend sets any
        body: JSON.stringify({ token: response.credential }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log("Login successful:", data);
  
        // Store user session in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("image", data.user.profilePic);
        localStorage.setItem("id", data.user._id);
  
        // Redirect to home or dashboard
        window.location.href = "/home";
      } else {
        console.error("Login failed:", data.error);
        alert("Google Login Failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  return <div id="google-login-button"></div>;
};

export default GoogleLoginButton;
