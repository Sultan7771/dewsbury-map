import React, { useContext, useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../AuthContext";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./ProfileWindow.css";

const ProfileWindow = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const userDoc = doc(FIRESTORE_DB, "businessmapusers", user.uid);
          const businessDoc = doc(FIRESTORE_DB, "businessmapbusinesses", user.uid);
          const userSnapshot = await getDoc(userDoc);
          const businessSnapshot = await getDoc(businessDoc);

          if (userSnapshot.exists()) {
            setProfileData(userSnapshot.data());
          } else if (businessSnapshot.exists()) {
            setProfileData(businessSnapshot.data());
          } else {
            console.log("No profile data found.");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error.message);
        }
      }
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Box className="profile-window">
      <Box className="profile-header">
        <Typography className="profile-title">Profile</Typography>
        <IconButton onClick={onClose} className="close-button">
          <CloseIcon />
        </IconButton>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <CircularProgress />
        </Box>
      ) : profileData ? (
        <div className="profile-content">
          <div className="profile-item">
            <label>Name:</label>
            <span>{profileData.name || profileData.businessName}</span>
          </div>
          <div className="profile-item">
            <label>Email:</label>
            <span>{profileData.email}</span>
          </div>
          {profileData.contact && (
            <div className="profile-item">
              <label>Contact:</label>
              <span>{profileData.contact}</span>
            </div>
          )}
          {profileData.address && (
            <div className="profile-item">
              <label>Address:</label>
              <span>{profileData.address}</span>
            </div>
          )}
          {profileData.industry && (
            <div className="profile-item">
              <label>Industry:</label>
              <span>{profileData.industry}</span>
            </div>
          )}
          {profileData.link && (
            <div className="profile-item">
              <label>Website:</label>
              <span>
                <a href={profileData.link} target="_blank" rel="noopener noreferrer">
                  {profileData.link}
                </a>
              </span>
            </div>
          )}
          {profileData.logoUrl && (
            <Box sx={{ textAlign: "center", marginTop: 2 }}>
              <img src={profileData.logoUrl} alt="Logo" className="profile-logo" />
            </Box>
          )}
          <Button className="logout-button" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <Typography sx={{ textAlign: "center" }}>No profile data available.</Typography>
      )}
    </Box>
  );
};

export default ProfileWindow;
