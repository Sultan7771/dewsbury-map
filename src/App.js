import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import MapComponent from "./components/MapComponent";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MapComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
