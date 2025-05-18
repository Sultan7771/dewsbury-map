import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import MapComponent from "./components/MapComponent";
import SignUpPage from "./components/SignUpPage";

function App() {
  // Custom Hook to determine the current location
  const location = useLocation();

  // Check if the current path is the root (MapComponent)
  const isMapPage = location.pathname === "/";

  return (
    <div>
      {isMapPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<MapComponent />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
