// Simple API utility functions (no auth)
const API_BASE_URL = (process.env.REACT_APP_API_URL
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : '')) || '';

const makeRequest = async (method, url, data = null, isFormData = false) => {
  const headers = { 'Accept': 'application/json' };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (data) config.body = isFormData ? data : JSON.stringify(data);

  const base = API_BASE_URL || '';
  const res = await fetch(`${base}${url}`, config);
  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    body = null;
  }
  if (!res.ok) {
    const msg = body?.message || `${method} ${url} failed with ${res.status}`;
    throw new Error(msg);
  }
  return { data: body };
};

export const api = {
  get: (url) => makeRequest('GET', url),
  post: (url, data, isFormData = false) => makeRequest('POST', url, data, isFormData),
  delete: (url) => makeRequest('DELETE', url),
};

// Loaded
