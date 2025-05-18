import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineSearch, AiOutlineTeam } from "react-icons/ai";
import ProfileDrawer from "./ProfileDrawer";  // Import Profile Drawer
import "./Navbar.css";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toggle profile drawer
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-logo" style={{ cursor: "pointer" }}>
        <img src="/BizMapLogo.png" alt="BizMap Logo" className="logo-image" />
      </div>
      <div className="navbar-icons">
        <AiOutlineUser size={50} className="icon" onClick={toggleProfile} style={{ cursor: "pointer" }} />
        <AiOutlineSearch size={50} className="icon" />
        <AiOutlineTeam size={50} className="icon" />
      </div>
      {isProfileOpen && <ProfileDrawer onClose={toggleProfile} />}  {/* Show Profile Drawer */}
    </div>
  );
};

export default Navbar;
