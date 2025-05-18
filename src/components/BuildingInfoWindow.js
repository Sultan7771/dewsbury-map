import React, { useState } from "react";
import "./BuildingInfoWindow.css";

const BuildingInfoWindow = ({ building }) => {
  // Always call useState at the top level
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

  // Tab content mapping
  const tabContent = {
    Posts: "No updates available at the moment.",
    Jobs: "No job listings available.",
    Details: (
      <>
        <div className="info-row">
          <span className="info-label">OS ID:</span>
          <span className="info-value">{osId}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Height:</span>
          <span className="info-value">{height} meters</span>
        </div>
      </>
    ),
    Contact: (
      <>
        <p>Email: info@building.com</p>
        <p>Website: www.building.com</p>
      </>
    ),
  };

  return (
    <div className="building-info-window">
      <div className="building-info-header">
        <div className="logo-circle">
          <span className="logo-text">B</span>
        </div>
        <div className="header-text">
          <h3>Building Info</h3>
          <p>{likes} likes • {followers} followers</p>
        </div>
      </div>
      <div className="tab-menu">
        {["Posts", "Jobs", "Details", "Contact"].map((tab) => (
          <span
            key={tab}
            className={`tab ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="building-info-content">
        <div className="section">
          <h4>{activeTab}</h4>
          <div>{tabContent[activeTab]}</div>
        </div>
      </div>
    </div>
  );
};

export default BuildingInfoWindow;
