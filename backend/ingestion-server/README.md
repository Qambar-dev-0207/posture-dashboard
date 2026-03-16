# Ingestion Server README

Python FastAPI server that polls ESP32 for posture data and stores to MongoDB.

## Features

- 🔄 Background polling of ESP32 API
- 💾 Automatic MongoDB storage
- 📊 Aggregation statistics
- 🏥 Clinical-grade data handling
- ✅ Health checks and monitoring

## Architecture

```
ESP32 Device (IP:80/api/posture)
        ↓
    [HTTP Request]
        ↓
  FastAPI Server
        ↓
   MongoDB Atlas
```

## Installation

### 1. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env`:

```env
MONGODB_URI=mongodb+srv://...
ESP32_API_URL=http://192.168.1.100:80/api/posture
PATIENT_ID=patient_001
POLL_INTERVAL=5
```

### 4. Run Server

```bash
python main.py
```

## API Endpoints

### Health Check

```bash
GET http://localhost:8000/

Response:
{
  "status": "running",
  "service": "Posture Data Ingestion Server",
  "esp32_api": "http://192.168.1.100:80/api/posture",
  "patient_id": "patient_001",
  "poll_interval_seconds": 5,
  "mongodb": "connected"
}
```

### Health Status

```bash
GET http://localhost:8000/health

Response:
{
  "status": "healthy",
  "mongodb": "connected",
  "scheduler": "running"
}
```

### Statistics

```bash
GET http://localhost:8000/stats

Response:
{
  "patient_id": "patient_001",
  "total_records": 1200,
  "bad_posture_records": 300,
  "bad_posture_percentage": 25.0,
  "latest_reading": {...}
}
```

### Manual Ingestion (Testing)

```bash
POST http://localhost:8000/manual-ingest

Body:
{
  "patient_id": "patient_001",
  "neck": 12,
  "back": 5,
  "waist": 3,
  "left_shoulder": 18,
  "right_shoulder": 20,
  "bad_posture": false
}

Response:
{
  "status": "success",
  "inserted_id": "...",
  "message": "Data manually ingested"
}
```

## Expected ESP32 JSON Format

The server expects the ESP32 to return:

```json
{
  "neck": 12,
  "back": 5,
  "waist": 3,
  "left_shoulder": 18,
  "right_shoulder": 20,
  "bad_posture": false
}
```

**Fields:**
- `neck` - Neck angle (0-25°)
- `back` - Back curvature (0-30°)
- `waist` - Waist angle (0-20°)
- `left_shoulder` - Left shoulder angle (0-45°)
- `right_shoulder` - Right shoulder angle (0-45°)
- `bad_posture` - Boolean flag

## Background Scheduler

The server automatically starts polling ESP32 at configured interval:

```python
scheduler.add_job(
    poll_esp32,
    'interval',
    seconds=POLL_INTERVAL_SECONDS
)
```

**Polling Flow:**
1. Timer triggers every N seconds
2. HTTP GET request to ESP32
3. Validate response
4. Add timestamp & patient_id
5. Insert into MongoDB
6. Log result

## MongoDB Indexes

Automatically created on startup:

```javascript
// Index for fast patient/date queries
db.posture_data.createIndex({
  "patient_id": 1,
  "timestamp": -1
})

// Index for bad_posture queries
db.posture_data.createIndex({
  "patient_id": 1,
  "bad_posture": 1,
  "timestamp": -1
})
```

## Logging

All operations logged to console:

```
✅ Connected to MongoDB
✅ Scheduler started - polling every 5s
✅ Data stored - ID: 507f1f77bcf86cd799439011
⚠️ Missing required fields in ESP32 response
❌ Error message
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Required | MongoDB Atlas connection |
| `ESP32_API_URL` | Required | ESP32 endpoint |
| `PATIENT_ID` | patient_001 | Patient identifier |
| `POLL_INTERVAL` | 5 | Seconds between polls |
| `SERVER_PORT` | 8000 | FastAPI port |
| `DEBUG` | False | Debug mode |

## Troubleshooting

### Can't connect to ESP32

```
⚠️ ESP32 API timeout
```

**Solutions:**
- Verify ESP32 IP address
- Check network connectivity
- Ensure ESP32 is running
- Check firewall rules

### MongoDB connection error

```
❌ MongoDB connection error
```

**Solutions:**
- Verify connection URI
- Check IP allowlist
- Confirm database exists
- Test connection manually

### No data being stored

**Diagnosis:**
1. Check `/stats` endpoint
2. Verify ESP32 is responding
3. Check MongoDB connection
4. Review logs for errors

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn

gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Using Docker

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY main.py .
CMD ["gunicorn", "main:app", "--workers", "4", "--bind", "0.0.0.0:8000"]
```

```bash
docker build -t posture-ingestion .
docker run -e MONGODB_URI=... -p 8000:8000 posture-ingestion
```

### Using SystemD

Create `/etc/systemd/system/posture-ingestion.service`:

```ini
[Unit]
Description=Posture Data Ingestion Service
After=network.target

[Service]
Type=simple
User=posture
WorkingDirectory=/home/posture/posture-ingestion
ExecStart=/home/posture/posture-ingestion/venv/bin/python main.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start posture-ingestion
sudo systemctl enable posture-ingestion
```

## Development

### Running with live reload

```bash
python main.py
```

### Testing manual ingestion

```python
import requests

response = requests.post('http://localhost:8000/manual-ingest', json={
    "patient_id": "test_001",
    "neck": 15,
    "back": 8,
    "waist": 5,
    "left_shoulder": 20,
    "right_shoulder": 22,
    "bad_posture": False
})

print(response.json())
```

---

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: February 2026
