import React, { useState } from "react";
import "../css/myPosts.css";
import FeedPage from "./feedPage";



interface Post {
    _id: string;
    SenderId: string;
    title: string;
    content: string;
    image?: string;
    userLikes: Array<string>;
    comments: number;
    date: Date;
  }
  

const MyPosts: React.FC = () => {
      const [posts, setPosts] = useState<Post[]>([]);

      const userId = localStorage.getItem("id") || "";
      const token = localStorage.getItem("accessToken"); 
      const  email = localStorage.getItem("email");
      const  name = localStorage.getItem("name");
      const  image = localStorage.getItem("image");
    
    return (
        <FeedPage filter={userId}></FeedPage>)
    
}



export default MyPosts;


