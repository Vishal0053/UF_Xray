import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : '')) || '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('[API] Getting auth headers, token exists:', !!token);
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[API] Authorization header added to request');
  } else {
    console.log('[API] No token found - request will be unauthorized');
  }
  
  return headers;
};

// Create a custom API client function
export const apiClient = {
  async get(url) {
    console.log('[API] Making GET request to:', url);
    try {
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: getAuthHeaders(),
        timeout: 30000
      });
      console.log('[API] GET request successful');
      return response;
    } catch (error) {
      console.log('[API] GET request failed:', error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      }
      throw error;
    }
  },
  
  async post(url, data, config = {}) {
    console.log('[API] Making POST request to:', url);
    try {
      const headers = config.headers || getAuthHeaders();
      
      // For FormData, don't set Content-Type (let browser set it)
      if (data instanceof FormData) {
        delete headers['Content-Type'];
      }
      
      const response = await axios.post(`${API_BASE_URL}${url}`, data, {
        ...config,
        headers,
        timeout: 30000
      });
      console.log('[API] POST request successful');
      return response;
    } catch (error) {
      console.log('[API] POST request failed:', error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      }
      throw error;
    }
  },
  
  async delete(url) {
    console.log('[API] Making DELETE request to:', url);
    try {
      const response = await axios.delete(`${API_BASE_URL}${url}`, {
        headers: getAuthHeaders(),
        timeout: 30000
      });
      console.log('[API] DELETE request successful');
      return response;
    } catch (error) {
      console.log('[API] DELETE request failed:', error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      }
      throw error;
    }
  }
};

console.log('[API] Custom API client created with manual auth headers');