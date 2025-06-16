import axios from 'axios';

// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.withCredentials = true; 