import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Input,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import "./SignUpPage.css";
import { signupUser } from "./authService"; // Import the signup function
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [link, setLink] = useState("");

  const handleNext = () => {
    if (page === 2 && userType === "individual") {
      // Skip the business details page if the user is an individual
      setPage(page + 2);
    } else {
      setPage(page + 1);
    }
  };

  const handleBack = () => {
    setPage(page - 1);
  };

  const handleUserTypeChange = (event, newType) => {
    if (newType !== null) {
      setUserType(newType);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    const userData = {
      name,
      email,
      password,
      userType,
      businessName,
      contact,
      address,
      industry,
      link,
      logo,
    };

    try {
      const response = await signupUser(userData);
      if (response.success) {
        alert("User registered successfully!");
        navigate("/map");  // Redirect to Map after signup

      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  return (
    <div className="signup-background">
      <Container maxWidth="sm" className="signup-container">
        <div className="signup-logo-container">
          <img
            src="/BizMapLogo.png"
            alt="BizMap Logo"
            className="signup-logo"
          />
        </div>
        <Typography variant="h4" className="signup-title" gutterBottom>
          {page === 1
            ? "Create Your BizMap Account"
            : page === 2
            ? "Choose Your Profile"
            : "Business Details"}
        </Typography>

        {page === 1 && (
          <Box component="form" onSubmit={handleNext} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="signup-button"
              onClick={handleNext}
            >
              Next
            </Button>
          </Box>
        )}

        {page === 2 && (
          <Box component="form" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Are you a business or an individual?
            </Typography>
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              fullWidth
              className="user-type-group"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="business" className="toggle-button">
                <BusinessIcon sx={{ mr: 1 }} />
                Business
              </ToggleButton>
              <ToggleButton value="individual" className="toggle-button">
                <PersonIcon sx={{ mr: 1 }} />
                Individual
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="signup-button"
              onClick={handleNext}
            >
              Next
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              className="signup-button"
              onClick={handleBack}
            >
              Back
            </Button>
          </Box>
        )}

        {page === 3 && userType === "business" && (
          <Box component="form" onSubmit={handleSignUp} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Business Details
            </Typography>
            <Button
              variant="contained"
              component="label"
              fullWidth
              startIcon={<PhotoCamera />}
              sx={{ mb: 2 }}
            >
              Upload Logo
              <input type="file" hidden onChange={handleLogoUpload} />
            </Button>
            {logoPreview && (
              <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {logo.name}
                </Typography>
              </Box>
            )}
            <TextField
              label="Business Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <TextField
              label="Contact"
              variant="outlined"
              fullWidth
              margin="normal"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              margin="normal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              label="Industry"
              variant="outlined"
              fullWidth
              margin="normal"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <TextField
              label="Website/Link"
              variant="outlined"
              fullWidth
              margin="normal"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="signup-button"
              type="submit"
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              className="signup-button"
              onClick={handleBack}
            >
              Back
            </Button>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default SignUpPage;
