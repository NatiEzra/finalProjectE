
import React, {useEffect} from "react";
import { Routes, Route } from "react-router-dom";
// import { Route, Routes, Router } from "react-router-dom";
import Layout from "./Layout";
import '../css/App.css';
import CreatePost from '../pages/createPost.tsx';
import FeedPage from '../pages/feedPage.tsx';
import LoginPage from "../pages/loginPage.tsx";
import RegisterPage from "../pages/registerPage.tsx";
import MyProfile from '../pages/myProfile.tsx';
import MyPosts from '../pages/myPosts.tsx';
import CommentsPage from '../pages/commentsPage.tsx';
import ForYou from '../pages/forYou.tsx';
import { startTokenRefresh, stopTokenRefresh, handleAuthLogout } from "../util/auth";

const App: React.FC = () => {

  useEffect(() => {
    //startTokenRefresh(); // ✅ Start automatic token refreshing when the app loads

    return () => {
      //stopTokenRefresh(); // ✅ Stop token refreshing when the component unmounts
    };
  }, []);

  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<FeedPage filter={""} />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="myPosts" element={<MyPosts />} />
          <Route path="createPost" element={<CreatePost />} />
          <Route path="comments/:postId" element={<CommentsPage />} />
          <Route path="forYou" element={<ForYou/>} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
  );
};

export default App;

