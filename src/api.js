import axios from 'axios';

// Determine the base URL based on the environment
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:5000';

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: `${API_URL}/api`, // All requests will be prefixed with this
});

export default api;