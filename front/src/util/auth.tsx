export const refreshAccessToken = async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // Stop if no token is found (logged out)
  
      const response = await fetch("http://localhost:3000/auth/refresh", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent with the request
      });
  
      if (!response.ok) {
        console.error("Failed to refresh token.");
        return;
      }
  
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken); // ✅ Update access token
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };
  
  // ✅ Start automatic token refreshing every 10 seconds
  let refreshInterval: NodeJS.Timeout | null = null;
  
  export const startTokenRefresh = (): void => {
    if (refreshInterval) return; // Prevent multiple intervals
  
    refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 10000); // Refresh every 10 seconds
  };
  
  export const stopTokenRefresh = (): void => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };
  
  export const handleAuthLogout = async (): Promise<void> => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include", // Ensures the refresh token cookie is cleared
      });
  
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
  
      stopTokenRefresh(); // ✅ Stop automatic refreshing
      window.location.href = "/login"; // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  