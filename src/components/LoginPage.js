import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { AuthContext } from "../AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log("Logged in successfully!");
      navigate('/');  // Redirect to map after successful login
    } catch (error) {
      console.error("Login failed:", error.message);
      setError("Invalid email or password. Please try again.");
    }
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
          {error && (
            <Typography variant="body1" color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
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
              style={{ cursor: 'pointer', color: '#1976d2' }}
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
