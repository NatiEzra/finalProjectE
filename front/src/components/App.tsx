
import React from "react";
import { Routes, Route } from "react-router-dom";
// import { Route, Routes, Router } from "react-router-dom";
import Layout from "./Layout";
import '../css/App.css';
import CreatePost from '../pages/createPost.tsx';
import FeedPage from '../pages/feedPage.tsx';
import LoginPage from "../pages/loginPage.tsx";
import RegisterPage from "../pages/registerPage.tsx";
import MyProfile from '../pages/myProfile.tsx';
// import myPost from './myPost.tsx';
const App: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<FeedPage />} />
          <Route path="profile" element={<MyProfile />} />
          {/* <Route path="myPosts" element={<MyPostsPage />} /> */}
          <Route path="createPost" element={<CreatePost />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
  );
};

export default App;

