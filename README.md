# 🧍 Medical-Grade Posture Analytics Platform

A production-ready, clinical-grade posture monitoring system that captures real-time body metrics from ESP32 wearables and provides comprehensive analytics, reports, and 3D visualization.

## 📋 System Architecture

```
ESP32 Device
    ↓ JSON (neck, back, waist, shoulders)
Python FastAPI Ingestion Server
    ↓ Poll & Store
MongoDB Atlas
    ↓ REST API
Node.js Express API Server
    ↓ Data Aggregation
React Dashboard
    ↓ Charts, 3D Model, Reports
```

## 🏗️ Project Structure

```
posture-platform/
├── backend/
│   ├── ingestion-server/       # Python FastAPI (polls ESP32)
│   └── api-server/             # Node.js Express (REST APIs)
├── frontend/                   # React Vite dashboard
├── docs/                       # Schemas, API docs
└── README.md
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Root .env
MONGODB_URI=your_atlas_uri
ESP32_API_URL=http://esp32_ip:80/api/posture
PATIENT_ID=patient_001
```

### 2. Run Ingestion Server

```bash
cd backend/ingestion-server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 3. Run API Server

```bash
cd backend/api-server
npm install
npm run dev
```

### 4. Run Dashboard

```bash
cd frontend
npm install
npm run dev
```

## 📊 Data Schema

**MongoDB Collection: `posture_data`**

```json
{
  "_id": ObjectId,
  "patient_id": "patient_001",
  "timestamp": 1707484800000,
  "neck": 12,
  "back": 5,
  "waist": 3,
  "left_shoulder": 18,
  "right_shoulder": 20,
  "bad_posture": false
}
```

## 🔌 API Endpoints

- `GET /api/data/daily/:date/:patientId` - Daily deviation summary
- `GET /api/data/hourly/:date/:patientId` - Hourly breakdown
- `GET /api/analytics/improvement/:patientId` - Improvement %
- `GET /api/analytics/worst-area/:date/:patientId` - Maximum deviation area
- `GET /api/reports/pdf/:patientId/:date` - PDF report generation

## 🎨 Dashboard Features

✅ Daily average deviation graphs  
✅ Hourly posture reports  
✅ Area with maximum deviation  
✅ Ideal vs actual angle comparison  
✅ Day-to-day improvement %  
✅ 3D human posture visualization  
✅ Downloadable PDF reports  
✅ Dark theme UI  
✅ Real-time refresh (5s)  

## 📈 Improvement Calculation

```
Improvement % = ((Yesterday Avg Deviation - Today Avg Deviation) / Yesterday Avg) * 100
```

## 🧾 PDF Report Sections

- Patient ID & Date
- Total monitored hours
- % good posture
- Average deviations (neck, back, waist, shoulders)
- Maximum deviation area
- Ideal vs actual angle comparison
- Improvement vs yesterday
- Recommendations

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Device | ESP32 with sensors |
| Ingestion | Python FastAPI, APScheduler |
| API | Node.js Express |
| Database | MongoDB Atlas |
| Frontend | React Vite, Recharts, React Three Fiber |
| Charts | Recharts (LineChart, BarChart, AreaChart) |
| 3D Model | Three.js, React Three Fiber |
| Styling | Tailwind CSS |
| Reports | jsPDF |
| HTTP Client | Axios |

## 🔐 Security & Production

- JWT authentication ready
- Environment-based config
- CORS configured
- Rate limiting ready
- Error logging
- Production ESLint setup

## 📚 Documentation

See `/docs/` for:
- [MongoDB Schema Details](./docs/schemas/MONGODB_SCHEMA.md)
- [API Documentation](./docs/api/API_SPEC.md)
- [Analytics Logic](./docs/ANALYTICS.md)
- [Installation Guide](./docs/INSTALLATION.md)

## 🚀 Deployment

### Production Ingestion Server
```bash
python -m gunicorn main:app --workers 4 --bind 0.0.0.0:8000
```

### Production API Server
```bash
npm run build
npm run start
```

### Production Dashboard
```bash
npm run build
# Deploy 'dist' folder to Vercel/Netlify
```

## 📞 Support

For clinical usage, ensure:
- Data encryption in transit (HTTPS)
- Patient data compliance (HIPAA)
- Audit logging enabled
- Regular database backups

---

**Status**: Clinical Research Grade  
**Version**: 1.0.0  
**Last Updated**: February 2026
