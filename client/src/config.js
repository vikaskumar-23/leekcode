// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios defaults
import axios from 'axios';
axios.defaults.withCredentials = true; 