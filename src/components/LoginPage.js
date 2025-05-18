import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Use navigate for redirection

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
  };

  return (
    <div className="login-background">
      <Container maxWidth="sm" className="login-container">
        <div className="logo-container">
          <img src="/BizMapLogo.png" alt="BizMap Logo" className="login-logo" />
        </div>
        <Typography variant="h4" align="center" gutterBottom className="login-title">
          BizMap Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} className="login-form">
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="login-button"
          >
            Log In
          </Button>
        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <span 
            className="signup-link"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default LoginPage;
