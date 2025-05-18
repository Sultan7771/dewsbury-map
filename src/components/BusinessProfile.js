import React, { useContext, useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import { AuthContext } from "../AuthContext";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const BusinessProfile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

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
            console.log("No user or business data found.");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error.message);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  if (!profileData) return <Typography>Loading profile...</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Business Profile</Typography>
      <Typography variant="h6">Name: {profileData.name || profileData.businessName}</Typography>
      <Typography>Email: {profileData.email}</Typography>
      {profileData.contact && <Typography>Contact: {profileData.contact}</Typography>}
      {profileData.address && <Typography>Address: {profileData.address}</Typography>}
      {profileData.industry && <Typography>Industry: {profileData.industry}</Typography>}
      {profileData.link && (
        <Typography>
          Website/Link: <a href={profileData.link} target="_blank" rel="noopener noreferrer">{profileData.link}</a>
        </Typography>
      )}
      {profileData.logoUrl && (
        <Box sx={{ marginTop: 2 }}>
          <img src={profileData.logoUrl} alt="Business Logo" style={{ width: 100, height: 100, borderRadius: 8 }} />
        </Box>
      )}
      <Button variant="outlined" sx={{ marginTop: 2 }} onClick={() => alert("Profile settings coming soon!")}>
        Edit Profile
      </Button>
    </Box>
  );
};

export default BusinessProfile;
