import React, { useState } from "react";
import { AiOutlineUser, AiOutlineSearch, AiOutlineTeam } from "react-icons/ai";
import "./Navbar.css";

const Navbar = ({ toggleProfile }) => {
  return (
    <div className="navbar">
      <div className="navbar-logo" style={{ cursor: "pointer" }}>
        <img src="/BizMapLogo.png" alt="BizMap Logo" className="logo-image" />
      </div>
      <div className="navbar-icons">
        <AiOutlineUser 
          size={50} 
          className="icon" 
          onClick={toggleProfile} 
          style={{ cursor: "pointer" }} 
        />
        <AiOutlineSearch size={50} className="icon" />
        <AiOutlineTeam size={50} className="icon" />
      </div>
    </div>
  );
};

export default Navbar;

