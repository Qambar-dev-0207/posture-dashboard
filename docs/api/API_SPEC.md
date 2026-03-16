# API Specification

Complete REST API documentation for posture analytics.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Health Check

**GET** `/health`

Check API and database status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Status Codes:**
- `200` - Healthy
- `503` - Unhealthy (database down, etc.)

---

### Daily Data

**GET** `/data/daily/:date/:patientId`

Get average deviations for a specific date.

**Parameters:**
- `date` (path) - Date in YYYY-MM-DD format
- `patientId` (path) - Patient identifier

**Example:**
```
GET /api/data/daily/2024-02-09/patient_001
```

**Response:**
```json
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "avg_neck": 12.35,
  "avg_back": 5.67,
  "avg_waist": 3.21,
  "avg_left_shoulder": 18.45,
  "avg_right_shoulder": 20.12,
  "max_neck": 25.00,
  "max_back": 15.50,
  "max_waist": 10.00,
  "max_left_shoulder": 35.20,
  "max_right_shoulder": 38.50,
  "bad_posture_percentage": 25.50,
  "good_posture_percentage": 74.50,
  "total_records": 1200
}
```

**Fields:**
- `avg_*` - Average deviation for each body area (degrees)
- `max_*` - Maximum deviation recorded for each area
- `bad_posture_percentage` - % of time posture was poor
- `total_records` - Total measurements for the day

---

### Hourly Data

**GET** `/data/hourly/:date/:patientId`

Get hourly breakdown for a specific date.

**Parameters:**
- `date` (path) - Date in YYYY-MM-DD format
- `patientId` (path) - Patient identifier

**Example:**
```
GET /api/data/hourly/2024-02-09/patient_001
```

**Response:**
```json
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "hourly_data": [
    {
      "hour": "2024-02-09T00:00:00.000Z",
      "hour_start": "2024-02-09T00:00:00.000Z",
      "avg_neck": 10.50,
      "avg_back": 4.20,
      "avg_waist": 2.50,
      "avg_left_shoulder": 15.30,
      "avg_right_shoulder": 18.50,
      "bad_posture_percentage": 20.00,
      "total_records": 100
    }
    // ... more hours
  ]
}
```

---

### Improvement Percentage

**GET** `/analytics/improvement/:patientId`

Calculate day-to-day improvement.

**Parameters:**
- `patientId` (path) - Patient identifier

**Example:**
```
GET /api/analytics/improvement/patient_001
```

**Response:**
```json
{
  "patient_id": "patient_001",
  "today_avg_deviation": 39.80,
  "yesterday_avg_deviation": 45.20,
  "improvement_percentage": 11.95,
  "status": "improving"
}
```

**Status Values:**
- `improving` - Improvement > 0%
- `degrading` - Improvement < 0%
- `stable` - Improvement ≈ 0%

**Formula:**
```
Improvement % = ((Yesterday Avg - Today Avg) / Yesterday Avg) * 100
```

---

### Worst Posture Area

**GET** `/analytics/worst-area/:date/:patientId`

Identify body area with maximum deviation.

**Parameters:**
- `date` (path) - Date in YYYY-MM-DD format
- `patientId` (path) - Patient identifier

**Example:**
```
GET /api/analytics/worst-area/2024-02-09/patient_001
```

**Response:**
```json
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "worst_area": "right_shoulder",
  "max_deviation": 20.12,
  "all_areas": {
    "neck": 12.35,
    "back": 5.67,
    "waist": 3.21,
    "left_shoulder": 18.45,
    "right_shoulder": 20.12
  }
}
```

---

### Comprehensive Report

**GET** `/reports/:patientId/:date`

Get full daily analysis report with recommendations.

**Parameters:**
- `patientId` (path) - Patient identifier
- `date` (path) - Date in YYYY-MM-DD format

**Example:**
```
GET /api/reports/patient_001/2024-02-09
```

**Response:**
```json
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "report": {
    "total_monitored_hours": 12,
    "total_records": 1200,
    "good_posture_percentage": 74.50,
    "bad_posture_percentage": 25.50,
    "average_deviations": {
      "neck": 12.35,
      "back": 5.67,
      "waist": 3.21,
      "left_shoulder": 18.45,
      "right_shoulder": 20.12
    },
    "improvement_vs_yesterday": 11.95,
    "recommendation": "✅ Great improvement! Keep up the good posture work."
  }
}
```

**Recommendation Logic:**
- `> +5%` - Excellent improvement
- `0% to +5%` - Good improvement
- `-5% to 0%` - Stable
- `< -5%` - Needs improvement

---

## Error Handling

All endpoints return error responses with consistent format:

```json
{
  "error": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad request
- `404` - Not found
- `500` - Server error
- `503` - Service unavailable

---

## Rate Limiting

Not yet implemented. For production:

```
Rate Limit: 100 requests/minute per IP
```

---

## Authentication

Not yet implemented. For production, add JWT:

```
Authorization: Bearer <token>
```

---

## Data Format Standards

### Timestamps
- Format: Milliseconds since Unix epoch
- Example: `1707484800000`

### Angles
- Unit: Degrees (0-360°)
- Precision: 2 decimal places

### Percentages
- Range: 0-100
- Precision: 2 decimal places

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get daily data
const response = await fetch('/api/data/daily/2024-02-09/patient_001');
const data = await response.json();
console.log(data);

// Get improvement
const improvement = await fetch('/api/analytics/improvement/patient_001');
const impData = await improvement.json();
console.log(`Improvement: ${impData.improvement_percentage}%`);
```

### cURL

```bash
# Daily data
curl http://localhost:5000/api/data/daily/2024-02-09/patient_001

# Hourly data
curl http://localhost:5000/api/data/hourly/2024-02-09/patient_001

# Improvement
curl http://localhost:5000/api/analytics/improvement/patient_001

# Worst area
curl http://localhost:5000/api/analytics/worst-area/2024-02-09/patient_001

# Full report
curl http://localhost:5000/api/reports/patient_001/2024-02-09
```

---

**Version**: 1.0  
**Last Updated**: February 2026
