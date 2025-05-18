import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, ToggleButton, ToggleButtonGroup } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import './SignUpPage.css';

const SignUpPage = () => {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');

  const handleNext = () => {
    setPage(2);
  };

  const handleBack = () => {
    setPage(1);
  };

  const handleUserTypeChange = (event, newType) => {
    if (newType !== null) {
      setUserType(newType);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    console.log("Signing up with", name, email, password, userType);
  };

  return (
    <div className="signup-background">
      <Container maxWidth="sm" className="signup-container">
        <div className="signup-logo-container">
          <img src="/BizMapLogo.png" alt="BizMap Logo" className="signup-logo" />
        </div>
        <Typography variant="h4" className="signup-title" gutterBottom>
          {page === 1 ? "Create Your BizMap Account" : "Choose Your Profile"}
        </Typography>
        {page === 1 ? (
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
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              className="signup-button"
              onClick={handleNext}
            >
              Next
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSignUp} sx={{ mt: 2 }}>
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
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="signup-button"
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              className="signup-button"
              onClick={handleBack}
              sx={{ mt: 1 }}
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
