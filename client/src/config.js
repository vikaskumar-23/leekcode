import axios from 'axios';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://leekcode.onrender.com';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for logging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test API connection on startup
const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await axios.get(`${API_URL}/api/check-auth`, {
      withCredentials: true
    });
    console.log('API connection test result:', response.data);
  } catch (error) {
    console.error('API connection test failed:', error);
  }
};

testConnection();

export { API_URL }; 