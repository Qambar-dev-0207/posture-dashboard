import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || '/api';

// Automatically append /api if it's a full URL but missing the prefix
if (API_BASE.startsWith('http') && !API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.endsWith('/') ? `${API_BASE}api` : `${API_BASE}/api`;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Daily data
export const getDailyData = (date, patientId) =>
  api.get(`/data/daily/${date}/${patientId}`);

// Hourly breakdown
export const getHourlyData = (date, patientId) =>
  api.get(`/data/hourly/${date}/${patientId}`);

// Improvement percentage
export const getImprovement = (patientId) =>
  api.get(`/analytics/improvement/${patientId}`);

// Worst area
export const getWorstArea = (date, patientId) =>
  api.get(`/analytics/worst-area/${date}/${patientId}`);

// Full report
export const getReport = (patientId, date) =>
  api.get(`/reports/${patientId}/${date}`);

// Health check
export const healthCheck = () =>
  api.get('/health').catch(() => ({ data: { status: 'unavailable' } }));

export default api;
