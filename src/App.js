import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import MapComponent from "./components/MapComponent";
import SignUpPage from "./components/SignUpPage";
import BusinessProfile from "./components/BusinessProfile";  // Import the profile page
import { AuthContext } from "./AuthContext";

// PrivateRoute Component to protect authenticated pages
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  // Custom Hook to determine the current location
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Show the Navbar only when the user is logged in
  const isAuthenticated = !!user;
  const isMapPage = location.pathname === "/";

  return (
    <div>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <BusinessProfile />
            </PrivateRoute>
          }
        />
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
