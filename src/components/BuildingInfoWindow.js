import React, { useState, useEffect } from "react";
import "./BuildingInfoWindow.css";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";

const BuildingInfoWindow = ({ building, onClose, onAddBusiness }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const [businessData, setBusinessData] = useState(null);

  const osId = building?.properties?.osid;

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!osId) return;
      const businessRef = doc(FIRESTORE_DB, "bizmapsbusiness", osId);
      const businessSnap = await getDoc(businessRef);

      if (businessSnap.exists()) {
        setBusinessData(businessSnap.data());
      } else {
        console.warn(`❌ No business found for osid: ${osId}`);
        setBusinessData(null);
      }
    };

    fetchBusinessInfo();
  }, [osId]);

  if (!building) return null;

  const height =
    building.properties.calculatedHeight ||
    building.properties.relativeheightmaximum ||
    building.properties.height_relativemax_m ||
    building.properties.absoluteheightmaximum ||
    "N/A";

  const name = businessData?.name || "No Business Registered";
  const logoUrl = businessData?.logo || "";
  const likes = businessData?.likes || 0;
  const followers = businessData?.followers || 0;
  const posts = businessData?.posts || [];
  const jobs = businessData?.jobs || [];
  const contact = businessData?.contact || {};

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className={`building-info-window ${isMinimized ? "minimized" : ""}`}>
      <div className="building-info-header">
        <div className="logo-circle">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="logo-img" />
          ) : (
            <span className="logo-text">🏢</span>
          )}
        </div>
        <div className="header-text">
          <h3>{name}</h3>
          {!isMinimized && businessData && (
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
          {businessData ? (
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
                    {posts.length > 0 ? (
                      posts.map((post, index) => (
                        <div key={index} className="post">
                          <strong>{post.title}</strong>
                          <p>{post.content}</p>
                        </div>
                      ))
                    ) : (
                      <p>No posts yet.</p>
                    )}
                  </div>
                )}
                {activeTab === "Jobs" && (
                  <div className="section">
                    <h4>Jobs</h4>
                    {jobs.length > 0 ? (
                      jobs.map((job, index) => (
                        <div key={index} className="job">
                          <strong>{job.title}</strong>
                          <p>{job.description}</p>
                        </div>
                      ))
                    ) : (
                      <p>No jobs posted yet.</p>
                    )}
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
                    <p>Email: {contact.email || "Not available"}</p>
                    <p>Website: {contact.website || "Not available"}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="section">
              <h4>Building Info</h4>
              <div className="info-row">
                <span className="info-label">OS ID:</span>
                <span className="info-value">{osId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Height:</span>
                <span className="info-value">{height} meters</span>
              </div>
              <p>This building has no business info yet.</p>
              {onAddBusiness && (
                <button className="add-business-btn" onClick={onAddBusiness}>
                  Add Business Info
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuildingInfoWindow;
