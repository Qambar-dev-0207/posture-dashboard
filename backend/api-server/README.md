# API Server README

Node.js Express server providing RESTful APIs for posture analytics.

## Features

- 📊 Real-time analytics endpoints
- 📈 MongoDB aggregation pipelines
- 🔄 Day-to-day comparison calculations
- 💡 Smart recommendations
- 🏥 Clinical-grade data processing

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run start
```

## API Endpoints

### Health Check

```bash
GET /api/health

Response:
{
  "status": "healthy",
  "database": "connected"
}
```

### Daily Data

```bash
GET /api/data/daily/2024-02-09/patient_001

Response:
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "avg_neck": 12.35,
  "avg_back": 5.67,
  "avg_waist": 3.21,
  "avg_left_shoulder": 18.45,
  "avg_right_shoulder": 20.12,
  "bad_posture_percentage": 25.5,
  "good_posture_percentage": 74.5,
  "total_records": 1200
}
```

### Hourly Data

```bash
GET /api/data/hourly/2024-02-09/patient_001

Response:
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "hourly_data": [
    {
      "hour": "2024-02-09T00:00:00.000Z",
      "avg_neck": 10.5,
      "avg_back": 4.2,
      "bad_posture_percentage": 20.0,
      "total_records": 100
    },
    ...
  ]
}
```

### Improvement Percentage

```bash
GET /api/analytics/improvement/patient_001

Response:
{
  "patient_id": "patient_001",
  "today_avg_deviation": 39.8,
  "yesterday_avg_deviation": 45.2,
  "improvement_percentage": 11.95,
  "status": "improving"
}
```

### Worst Area

```bash
GET /api/analytics/worst-area/2024-02-09/patient_001

Response:
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

### Comprehensive Report

```bash
GET /api/reports/patient_001/2024-02-09

Response:
{
  "patient_id": "patient_001",
  "date": "2024-02-09",
  "report": {
    "total_monitored_hours": 12,
    "good_posture_percentage": 74.5,
    "bad_posture_percentage": 25.5,
    "average_deviations": {...},
    "improvement_vs_yesterday": 11.95,
    "recommendation": "✅ Great improvement! Keep up the good posture work."
  }
}
```

## Database Connection

Uses MongoDB driver with native aggregation pipelines:

```javascript
const { MongoClient } = require('mongodb');

const mongoClient = new MongoClient(MONGODB_URI);
const db = mongoClient.db('posture');
const collection = db.collection('posture_data');
```

## Aggregation Pipelines

### Daily Average

```javascript
collection.aggregate([
  { $match: { patient_id, timestamp: { $gte, $lt } } },
  { $group: {
    _id: '$patient_id',
    avg_neck: { $avg: '$neck' },
    avg_back: { $avg: '$back' },
    ...
  }}
])
```

### Hourly Breakdown

```javascript
collection.aggregate([
  { $match: { patient_id, timestamp: { $gte, $lt } } },
  { $group: {
    _id: { hour: { $floor: { $divide: ['$timestamp', 3600000] } } },
    hour_start: { $min: '$timestamp' },
    avg_neck: { $avg: '$neck' },
    ...
  }},
  { $sort: { hour_start: 1 } }
])
```

## Error Handling

Consistent error responses:

```json
{
  "error": "Error description"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `404` - Not found
- `500` - Server error
- `503` - Service unavailable

## CORS Configuration

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
```

Allows requests from:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (CRA)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Required | MongoDB connection |
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed origins |

## Production Deployment

### Using PM2

```bash
npm install -g pm2

pm2 start src/server.js --name "posture-api"
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs posture-api
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]
```

```bash
docker build -t posture-api .
docker run -e MONGODB_URI=... -p 5000:5000 posture-api
```

### Performance Tips

1. **Add Caching:**
```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/data/daily/:date/:patientId', async (req, res) => {
  const cacheKey = `daily:${req.params.date}:${req.params.patientId}`;
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // ... fetch from database
  await client.setEx(cacheKey, 300, JSON.stringify(data)); // 5 min cache
  res.json(data);
});
```

2. **Connection Pooling:**
```javascript
const mongoClient = new MongoClient(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2
});
```

3. **Index Database Queries:**
Already created in ingestion server.

## Development

### File Structure

```
src/
├── server.js          # Main server file
├── routes/            # API route handlers
├── middleware/        # Express middleware
├── utils/             # Helper functions
└── models/            # Data models
```

### Testing Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get daily data
curl http://localhost:5000/api/data/daily/2024-02-09/patient_001

# Get improvement
curl http://localhost:5000/api/analytics/improvement/patient_001
```

### debugging

Enable detailed logging:

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.time(`${req.method} ${req.path}`);
  res.on('finish', () => {
    console.timeEnd(`${req.method} ${req.path}`);
  });
  next();
});
```

---

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: February 2026
