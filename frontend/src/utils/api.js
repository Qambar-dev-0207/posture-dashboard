import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
