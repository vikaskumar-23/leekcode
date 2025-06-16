import axios from 'axios';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://leekcode.onrender.com';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export { API_URL }; 