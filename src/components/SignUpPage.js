import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import './SignUpPage.css';

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Info:", { name, email, password, userType });
  };

  return (
    <div className="signup-background">
      <Container maxWidth="sm" className="signup-container">
        <Typography variant="h4" align="center" className="signup-title" gutterBottom>
          {step === 1 ? "Sign Up" : "User Type"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} className="signup-form">
          {step === 1 && (
            <>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleNext}
                className="signup-button"
              >
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <FormLabel component="legend" className="user-type-label">Select User Type</FormLabel>
              <RadioGroup
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="user-type-group"
              >
                <FormControlLabel value="Business" control={<Radio />} label="Business" />
                <FormControlLabel value="Individual" control={<Radio />} label="Individual" />
              </RadioGroup>
              <Button
                variant="contained"
                fullWidth
                onClick={handleBack}
                className="back-button"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="signup-button"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default SignUpPage;
