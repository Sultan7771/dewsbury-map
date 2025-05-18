import React, { useState } from "react";
import "./BuildingInfoWindow.css";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  const navItems = [
    { name: "Profile", icon: "🏠" },
    { name: "Search", icon: "🔍" },
    { name: "Community", icon: "📬" },
  ];

  return (
    <div className="navbar">
      {navItems.map((item) => (
        <div
          key={item.name}
          className={`nav-item ${activeTab === item.name ? "active" : ""}`}
          onClick={() => setActiveTab(item.name)}
        >
          <div className="nav-icon">{item.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default Navbar;
