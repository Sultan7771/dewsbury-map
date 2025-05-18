import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import MapComponent from "./components/MapComponent";
import SignUpPage from "./components/SignUpPage";
import { AuthContext } from "./AuthContext";

// PrivateRoute Component to protect the map page
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  // Custom Hook to determine the current location
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Check if the current path is the root (MapComponent) and user is authenticated
  const isMapPage = location.pathname === "/" && user;

  return (
    <div>
      {isMapPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MapComponent />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

// App Wrapper with Router
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
