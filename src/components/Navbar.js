import React from "react";
import { AiOutlineUser, AiOutlineSearch, AiOutlineTeam } from "react-icons/ai";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="/BizMapLogo.png" alt="BizMap Logo" className="logo-image" />
      </div>
      <div className="navbar-icons">
        <AiOutlineUser size={32} className="icon" />
        <AiOutlineSearch size={32} className="icon" />
        <AiOutlineTeam size={32} className="icon" />
      </div>
    </div>
  );
};

export default Navbar;
