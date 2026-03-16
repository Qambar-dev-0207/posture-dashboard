# Installation & Setup Guide

Complete setup instructions for the posture analytics platform.

## Prerequisites

- **Node.js** 16+ (for frontend & API server)
- **Python** 3.8+ (for ingestion server)
- **MongoDB Atlas** account with connection URI
- **Git** (optional)

---

## 1️⃣ MongoDB Atlas Setup

### Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free tier cluster
3. Create database named `posture`
4. Generate connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
   ```
5. Add your IP to IP Allowlist

### Create Collections

MongoDB will auto-create collections, but you can manually create:

```javascript
// In MongoDB shell or Atlas UI
use posture;
db.createCollection("posture_data");
db.posture_data.createIndex({ "patient_id": 1, "timestamp": -1 });
```

---

## 2️⃣ Python Ingestion Server

### Setup

```bash
cd backend/ingestion-server

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
ESP32_API_URL=http://192.168.1.100:80/api/posture
PATIENT_ID=patient_001
POLL_INTERVAL=5
```

### Run

```bash
python main.py
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ MongoDB indexes created successfully
✅ Scheduler started - polling every 5s
[INFO] Uvicorn running at http://0.0.0.0:8000
```

### Check Health

```bash
curl http://localhost:8000/
curl http://localhost:8000/health
curl http://localhost:8000/stats
```

---

## 3️⃣ Node.js API Server

### Setup

```bash
cd backend/api-server

# Install dependencies
npm install
```

### Configuration

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Run Development

```bash
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 API Server running at http://localhost:5000
📊 API Endpoints:
  GET /api/health
  GET /api/data/daily/:date/:patientId
  ...
```

### Run Production

```bash
npm run start
```

### Test API

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/data/daily/2024-02-09/patient_001
```

---

## 4️⃣ React Dashboard

### Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Configuration

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### Run Development

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 5️⃣ Verify Full Stack

### 1. Check All Services Running

```bash
# Terminal 1 - Ingestion Server (port 8000)
cd backend/ingestion-server
python main.py

# Terminal 2 - API Server (port 5000)
cd backend/api-server
npm run dev

# Terminal 3 - Dashboard (port 5173)
cd frontend
npm run dev
```

### 2. Test Data Flow

```bash
# Ingest test data
curl -X POST http://localhost:8000/manual-ingest \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_001",
    "neck": 12,
    "back": 5,
    "waist": 3,
    "left_shoulder": 18,
    "right_shoulder": 20,
    "bad_posture": false
  }'

# Check if stored
curl http://localhost:5000/api/data/daily/2024-02-09/patient_001
```

### 3. Open Dashboard

Navigate to http://localhost:5173 and verify:
- ✅ Header shows "API: Online"
- ✅ Dashboard loads data
- ✅ Charts display

---

## Troubleshooting

### Ingestion Server won't connect to MongoDB

```
Error: connection refused
Solution: 
  1. Check MongoDB URI in .env
  2. Verify IP allowlist in MongoDB Atlas
  3. Check internet connection
```

### API Server port already in use

```
Error: EADDRINUSE: address already in use :::5000
Solution:
  netstat -ano | findstr :5000  // Windows
  lsof -i :5000                 // macOS/Linux
  kill -9 <PID>
```

### Dashboard fails to load data

```
Error: CORS policy
Solution:
  1. Ensure CORS origins in .env correct
  2. Restart API server after changing .env
  3. Check browser console for detailed error
```

### MongoDB connection timeout

```
Error: Server selection timed out
Solution:
  1. Add your IP to MongoDB Atlas IP Allowlist
  2. Use 0.0.0.0/0 for development only
  3. Check firewall settings
```

---

## Production Deployment

### Python Ingestion (Gunicorn)

```bash
pip install gunicorn

gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --daemon
```

### Node.js API (PM2)

```bash
npm install -g pm2

pm2 start src/server.js --name "posture-api"
pm2 startup
pm2 save
```

### React Dashboard (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy dist/ folder to Vercel/Netlify
vercel deploy --prod
```

### Environment Variables for Production

```env
# Security
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>

# Database
MONGODB_URI=<atlas-uri>

# CORS - restrict origins
CORS_ORIGIN=https://yourdomain.com

# HTTPS required
SECURE_COOKIES=true
```

---

## Security Hardening

### 1. Database

- ✅ Use strong passwords
- ✅ Enable IP allowlist
- ✅ Use VPN for remote access
- ✅ Regular backups

### 2. API

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### 3. Frontend

- ✅ Use HTTPS only
- ✅ Set Content Security Policy headers
- ✅ Hide sensitive data in logs
- ✅ Regular dependency updates

---

## Monitoring

### Ingestion Server

```bash
# Check stats
curl http://localhost:8000/stats

# Example response
{
  "patient_id": "patient_001",
  "total_records": 1200,
  "bad_posture_records": 300,
  "bad_posture_percentage": 25
}
```

### API Server

```bash
# Health check
curl http://localhost:5000/api/health

# Monitor logs
tail -f /var/log/posture-api.log
```

### Dashboard

- Check browser console for errors
- Monitor API response times in Network tab
- Check server logs for 5xx errors

---

## Maintenance

### Regular Tasks

- [ ] Monitor database growth
- [ ] Clean old data (implement TTL)
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review logs for errors

### Database Cleanup

```javascript
// Archive old data after 90 days
db.posture_data.deleteMany({
  created_at: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

---

**Version**: 1.0  
**Last Updated**: February 2026
