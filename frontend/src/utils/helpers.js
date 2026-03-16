export const formatDate = (date) => {
  if (typeof date === 'string') return date;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const getColorForDeviation = (deviation, maxDeviation = 30) => {
  const percentage = (deviation / maxDeviation) * 100;
  if (percentage < 20) return '#10b981'; // Green
  if (percentage < 40) return '#3b82f6'; // Blue
  if (percentage < 60) return '#f59e0b'; // Amber
  if (percentage < 80) return '#ef4444'; // Red
  return '#991b1b'; // Dark Red
};

export const getDeviationCategory = (value) => {
  if (value < 5) return 'Excellent';
  if (value < 10) return 'Good';
  if (value < 15) return 'Fair';
  if (value < 20) return 'Poor';
  return 'Critical';
};

export const calculateHourFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.getHours();
};
