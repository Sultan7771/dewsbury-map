import React from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineSearch, AiOutlineTeam } from "react-icons/ai";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate(); // Hook to navigate between pages

  // Navigate to the login page when the logo is clicked
  const handleLogoClick = () => {
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src="/BizMapLogo.png" alt="BizMap Logo" className="logo-image" />
      </div>
      <div className="navbar-icons">
        <AiOutlineUser size={50} className="icon" />
        <AiOutlineSearch size={50} className="icon" />
        <AiOutlineTeam size={50} className="icon" />
      </div>
    </div>
  );
};

export default Navbar;
