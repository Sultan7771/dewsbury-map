import React, { useState } from "react";
import "./BuildingInfoWindow.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai"; 

const BuildingInfoWindow = ({ building }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");

  if (!building) return null;

  const height =
    building.properties.calculatedHeight ||
    building.properties.relativeheightmaximum ||
    building.properties.height_relativemax_m ||
    building.properties.absoluteheightmaximum ||
    "N/A";

  const osId = building.properties.osid || "N/A";
  const likes = building.properties.likes || "234";
  const followers = building.properties.followers || "512";

  // Toggle minimize/expand view
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle tab change
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className={`building-info-window ${isMinimized ? "minimized" : ""}`}>
      <div className="building-info-header">
        <div className="logo-circle">
          <span className="logo-text">B</span>
        </div>
        <div className="header-text">
          <h3>Building Info</h3>
          {!isMinimized && (
            <p>
              {likes} likes • {followers} followers
            </p>
          )}
        </div>
        <div className="minimize-icon" onClick={toggleMinimize}>
          {isMinimized ? (
            <AiOutlinePlusCircle size={28} style={{ color: "#007bff" }} />
          ) : (
            <AiOutlineMinusCircle size={28} style={{ color: "#007bff" }} />
          )}
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="tab-menu">
            {["Posts", "Jobs", "Details", "Contact"].map((tab) => (
              <span
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="building-info-content">
            {activeTab === "Posts" && (
              <div className="section">
                <h4>Posts</h4>
                <p>Stay updated with the latest posts from this building.</p>
              </div>
            )}
            {activeTab === "Jobs" && (
              <div className="section">
                <h4>Jobs</h4>
                <p>Explore job opportunities available at this location.</p>
              </div>
            )}
            {activeTab === "Details" && (
              <div className="section">
                <h4>Details</h4>
                <div className="info-row">
                  <span className="info-label">OS ID:</span>
                  <span className="info-value">{osId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Height:</span>
                  <span className="info-value">{height} meters</span>
                </div>
              </div>
            )}
            {activeTab === "Contact" && (
              <div className="section">
                <h4>Contact</h4>
                <p>Email: info@building.com</p>
                <p>Website: www.building.com</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuildingInfoWindow;
