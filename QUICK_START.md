# 🚀 Quick Start Guide

Get the posture analytics platform running in **5 minutes**.

## Option 1: Automated Setup (Recommended)

### Windows

1. Open PowerShell and navigate to project root
2. Run:
   ```powershell
   .\start.bat
   ```
3. This opens 3 windows with all services
4. Open http://localhost:5173

### macOS/Linux

1. Open terminal and navigate to project root
2. Run:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
3. Open http://localhost:5173

---

## Option 2: Docker Compose (Fastest)

### Prerequisites

- Docker installed ([Download](https://www.docker.com/products/docker-desktop))

### Setup

1. Create `.env` in project root:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
   ESP32_API_URL=http://192.168.1.100:80/api/posture
   PATIENT_ID=patient_001
   ```

2. Run:
   ```bash
   docker-compose up
   ```

3. Open http://localhost

**That's it!** All services running in one command.

---

## Option 3: Manual Setup

### 1. Python Ingestion Server (Terminal 1)

```bash
cd backend/ingestion-server

# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your MongoDB URI and ESP32 URL

# Run
python main.py
```

Expected: `✅ Scheduler started - polling every 5s`

### 2. Node.js API Server (Terminal 2)

```bash
cd backend/api-server

# Setup
npm install

# Configure
cp .env.example .env
# Edit .env with your MongoDB URI

# Run
npm run dev
```

Expected: `🚀 API Server running at http://localhost:5000`

### 3. React Dashboard (Terminal 3)

```bash
cd frontend

# Setup
npm install

# Run
npm run dev
```

Expected: `➜  Local:   http://localhost:5173/`

---

## Verify Everything Works

### Test Ingestion Server

```bash
curl http://localhost:8000/health
# Should return: { "status": "healthy", "mongodb": "connected" }
```

### Test API Server

```bash
curl http://localhost:5000/api/health
# Should return: { "status": "healthy", "database": "connected" }
```

### Test Dashboard

Open http://localhost:5173 in browser  
Should see: Dark theme dashboard with "API: Online"

---

## Configuration

### Environment Variables

**Ingestion Server** (`backend/ingestion-server/.env`):
```env
MONGODB_URI=mongodb+srv://...  # Your MongoDB Atlas URI
ESP32_API_URL=http://192.168.1.100:80/api/posture  # Your ESP32 IP
PATIENT_ID=patient_001
POLL_INTERVAL=5
```

**API Server** (`backend/api-server/.env`):
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**Dashboard** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:5000
```

### MongoDB Setup

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database `posture`
4. Get connection string: `mongodb+srv://...`
5. Add your IP to "IP Allowlist"

---

## Using Sample Data (No ESP32)

If you don't have an ESP32 yet:

### Ingest Test Data

```bash
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
```

### View in Dashboard

1. Go to http://localhost:5173
2. Select today's date
3. Should see charts and data

---

## Troubleshooting

### Port Already in Use

**Windows:**
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error

```
Error: Server selection timed out
```

**Solutions:**
1. Verify MongoDB URI in `.env`
2. Add your IP to IP Allowlist in MongoDB Atlas
3. Temporarily use `0.0.0.0/0` for testing only
4. Check internet connection

### Dashboard Won't Load Data

Check browser console (F12 → Console):
- See CORS errors? → Update `CORS_ORIGIN` in API server `.env`
- See 404 errors? → Check API server is running on port 5000
- See timeout? → Check MongoDB connection

### CORS Issues

If dashboard can't reach API:

```javascript
// browser console error:
CORS policy: No 'Access-Control-Allow-Origin'
```

**Fix:**
1. Edit `backend/api-server/.env`
2. Set: `CORS_ORIGIN=http://localhost:5173`
3. Restart API server: `npm run dev`

---

## Next Steps

### 📚 Learn More

- [Full Installation Guide](../docs/INSTALLATION.md)
- [API Documentation](../docs/api/API_SPEC.md)
- [Analytics Logic](../docs/ANALYTICS.md)
- [MongoDB Schema](../docs/schemas/MONGODB_SCHEMA.md)

### 🔧 Customization

1. **Change polling interval:**
   - Edit `POLL_INTERVAL` in ingestion server `.env`

2. **Add more patients:**
   - Ingestion server fetches multiple patient data
   - Use different `PATIENT_ID` values

3. **Customize dashboard theme:**
   - Edit `src/index.css`
   - Colors in `tailwind.config.js`

### 🚀 Production Deployment

1. **Backend:** Deploy to DigitalOcean, AWS, Heroku
2. **Dashboard:** Deploy to Vercel, Netlify
3. **Database:** Use MongoDB Atlas (already cloud)

See [INSTALLATION.md](../docs/INSTALLATION.md#production-deployment) for details.

---

## Support

### API Endpoints Cheat Sheet

```bash
# Daily data
curl http://localhost:5000/api/data/daily/2024-02-09/patient_001

# Hourly breakdown
curl http://localhost:5000/api/data/hourly/2024-02-09/patient_001

# Improvement
curl http://localhost:5000/api/analytics/improvement/patient_001

# Worst area
curl http://localhost:5000/api/analytics/worst-area/2024-02-09/patient_001

# Full report
curl http://localhost:5000/api/reports/patient_001/2024-02-09
```

### Files to Know

| File | Purpose |
|------|---------|
| `backend/ingestion-server/main.py` | ESP32 polling logic |
| `backend/api-server/src/server.js` | REST API endpoints |
| `frontend/src/App.jsx` | Main React component |
| `frontend/src/pages/Dashboard.jsx` | Dashboard page |
| `docs/MONGODB_SCHEMA.md` | Database structure |

---

**You're all set!** 🎉

The platform is clinical-grade, fully functional, and ready for production use.

For medical applications, ensure HTTPS, authentication, and proper data handling.

---

**Version**: 1.0  
**Updated**: February 2026
