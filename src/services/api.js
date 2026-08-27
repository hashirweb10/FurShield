const API_BASE = 'http://localhost/FurShield-Public-UI-FIXED/FurShield-Public-UI-FIXED/FurShield/backend/api';

async function request(url, options = {}) {
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  try {
    const res = await fetch(`${API_BASE}${url}`, config);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body }),
  put: (url, body) => request(url, { method: 'PUT', body }),
  delete: (url) => request(url, { method: 'DELETE' }),
  upload: (url, formData) => request(url, { method: 'POST', body: formData }),
};

export default api;
