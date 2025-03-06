import { useState } from 'react'

import '../css/App.css'
import React from "react";
import LoginPage from "./loginPage.tsx";
import Register from "./registerPage.tsx";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;

