# 📚 Complete File Index

Comprehensive list of all files in the posture analytics platform.

## 📁 Project Structure

```
posture-platform/
├── 📄 README.md                          # Project overview
├── 📄 QUICK_START.md                     # Get started in 5 minutes
├── 📄 .gitignore                         # Git ignore rules
├── 📄 .env.example                       # Environment template
├── 📄 docker-compose.yml                 # Docker containerization
├── 🐍 setup.py                           # Automated setup script
├── 🔧 start.sh                           # Linux/macOS launcher
├── 🔧 start.bat                          # Windows launcher
│
├── 📁 docs/                              # Documentation
│   ├── 📄 ARCHITECTURE.md                # System design & diagrams
│   ├── 📄 ANALYTICS.md                   # Analytics calculations
│   ├── 📄 INSTALLATION.md                # Detailed setup guide
│   │
│   ├── 📁 api/
│   │   └── 📄 API_SPEC.md               # Complete API documentation
│   │
│   └── 📁 schemas/
│       └── 📄 MONGODB_SCHEMA.md         # Database schema design
│
├── 📁 backend/
│   │
│   ├── 📁 ingestion-server/            # Python FastAPI
│   │   ├── 📄 main.py                  # Main application
│   │   ├── 📄 requirements.txt          # Python dependencies
│   │   ├── 📄 .env.example              # Config template
│   │   ├── 📄 Dockerfile                # Docker image
│   │   └── 📄 README.md                 # Server documentation
│   │
│   └── 📁 api-server/                  # Node.js Express
│       ├── 📄 package.json              # NPM config
│       ├── 📄 .env.example              # Config template
│       ├── 📄 Dockerfile                # Docker image
│       ├── 📄 README.md                 # Server documentation
│       │
│       └── 📁 src/
│           └── 📄 server.js             # Main API server
│
└── 📁 frontend/                         # React Dashboard
    ├── 📄 package.json                  # NPM config
    ├── 📄 vite.config.js                # Vite configuration
    ├── 📄 tailwind.config.js            # Tailwind CSS config
    ├── 📄 index.html                    # HTML entry point
    ├── 📄 Dockerfile                    # Docker image
    ├── 📄 README.md                     # Dashboard documentation
    │
    ├── 📁 src/
    │   ├── 📄 main.jsx                  # React entry point
    │   ├── 📄 App.jsx                   # Root component
    │   ├── 📄 index.css                 # Global styles
    │   │
    │   ├── 📁 pages/
    │   │   └── 📄 Dashboard.jsx         # Main dashboard page
    │   │
    │   ├── 📁 components/
    │   │   ├── 📄 Header.jsx            # Navigation header
    │   │   ├── 📄 DeviationCharts.jsx   # Recharts visualizations
    │   │   ├── 📄 Posture3D.jsx         # Three.js 3D model
    │   │   ├── 📄 ReportGenerator.jsx   # PDF export
    │   │   └── 📄 ImprovementCard.jsx   # Progress metrics
    │   │
    │   └── 📁 utils/
    │       ├── 📄 api.js                # API client (Axios)
    │       └── 📄 helpers.js            # Utility functions
    │
    └── 📁 public/
        └── 📁 models/                    # 3D model files (GLTF)
```

---

## 📋 File Details

### Root Files

| File | Purpose | Type |
|------|---------|------|
| `README.md` | Project overview, architecture, features | Markdown |
| `QUICK_START.md` | 5-minute setup guide | Markdown |
| `.gitignore` | Git ignore patterns | Config |
| `.env.example` | Environment variables template | Config |
| `docker-compose.yml` | Docker orchestration | YAML |
| `setup.py` | Automated installation script | Python |
| `start.sh` | Linux/macOS service launcher | Bash |
| `start.bat` | Windows service launcher | Batch |

### Documentation Files

| File | Content |
|------|---------|
| `docs/ARCHITECTURE.md` | System design, data flow, schemas, diagrams |
| `docs/ANALYTICS.md` | Formulas, calculations, algorithms |
| `docs/INSTALLATION.md` | Complete setup instructions, troubleshooting |
| `docs/api/API_SPEC.md` | REST endpoints, request/response examples |
| `docs/schemas/MONGODB_SCHEMA.md` | Collections, fields, indexes, aggregations |

### Python Ingestion Server

| File | Content |
|------|---------|
| `backend/ingestion-server/main.py` | FastAPI server, polling logic, MongoDB integration |
| `backend/ingestion-server/requirements.txt` | `fastapi`, `pymongo`, `apscheduler`, `httpx` |
| `backend/ingestion-server/.env.example` | MongoDB URI, ESP32 URL, polling interval |
| `backend/ingestion-server/Dockerfile` | Python 3.11 Alpine image, health checks |
| `backend/ingestion-server/README.md` | Setup, endpoints, troubleshooting |

**Key Functions:**
- `poll_esp32()` - Fetch data from ESP32
- `create_indexes()` - MongoDB performance optimization
- `/manual-ingest` - Test data ingestion
- `/stats` - Statistics endpoint

### Node.js API Server

| File | Content |
|------|---------|
| `backend/api-server/src/server.js` | Express server, MongoDB aggregations, REST routes |
| `backend/api-server/package.json` | Express, MongoDB driver, CORS, dotenv |
| `backend/api-server/.env.example` | MongoDB URI, port, CORS origins |
| `backend/api-server/Dockerfile` | Node.js 18 Alpine, health checks |
| `backend/api-server/README.md` | Setup, endpoints, performance tips |

**API Routes:**
- `GET /api/health` - Health check
- `GET /api/data/daily/:date/:patientId` - Daily aggregation
- `GET /api/data/hourly/:date/:patientId` - Hourly breakdown
- `GET /api/analytics/improvement/:patientId` - Day comparison
- `GET /api/analytics/worst-area/:date/:patientId` - Max deviation area
- `GET /api/reports/:patientId/:date` - Comprehensive report

### React Frontend

| File | Purpose |
|------|---------|
| `frontend/index.html` | HTML entry point |
| `frontend/package.json` | React, Vite, Recharts, Three.js dependencies |
| `frontend/vite.config.js` | Vite bundler, API proxy, aliases |
| `frontend/tailwind.config.js` | Tailwind CSS theme configuration |
| `frontend/src/main.jsx` | React root mount |
| `frontend/src/App.jsx` | Root component, API status, patient ID |
| `frontend/src/index.css` | Global styles, Tailwind directives |
| `frontend/src/pages/Dashboard.jsx` | Main dashboard, data fetching, date selector |
| `frontend/src/components/Header.jsx` | Navigation, status indicator |
| `frontend/src/components/DeviationCharts.jsx` | Radar, Bar, Area charts (Recharts) |
| `frontend/src/components/Posture3D.jsx` | 3D human model (Three.js) |
| `frontend/src/components/ReportGenerator.jsx` | PDF export (jsPDF) |
| `frontend/src/components/ImprovementCard.jsx` | Day-to-day progress metrics |
| `frontend/src/utils/api.js` | Axios API client, endpoint functions |
| `frontend/src/utils/helpers.js` | Date formatting, color mapping, helpers |

---

## 🔗 Dependencies Summary

### Python (Ingestion Server)

```
fastapi==0.104.1             # Web framework
uvicorn==0.24.0              # ASGI server
pymongo==4.6.0               # MongoDB driver
httpx==0.25.2                # Async HTTP client
apscheduler==3.10.4          # Background task scheduler
python-dotenv==1.0.0         # Environment variables
```

### Node.js (API Server)

```
express==4.18.2              # Web framework
mongodb==6.3.0               # MongoDB driver
cors==2.8.5                  # CORS middleware
dotenv==16.3.1               # Environment variables
jspdf==2.5.1                 # PDF generation
html2canvas==1.4.1           # HTML to image
```

### React (Frontend)

```
react==18.2.0                # React library
react-dom==18.2.0            # React DOM
vite==5.0.8                  # Build tool
recharts==2.10.3             # Chart library
three==r160                  # 3D graphics
@react-three/fiber==8.14.5   # React binding for Three.js
@react-three/drei==9.92.4    # Three.js utilities
tailwindcss==3.4.1           # CSS framework
axios==1.6.2                 # HTTP client
date-fns==2.30.0             # Date utilities
```

---

## 📊 Code Statistics

| Component | Files | Lines of Code | Type |
|-----------|-------|---|------|
| Ingestion Server | 2 | ~400 | Python |
| API Server | 1 | ~600 | JavaScript |
| Dashboard | 9 | ~2000 | React/JavaScript |
| Documentation | 5 | ~3000 | Markdown |
| Config/Build | 7 | ~400 | Various |
| **TOTAL** | **24** | **~6400** | |

---

## 🔄 Data Files

### Stored in MongoDB

```
Collection: posture_data
├── _id (ObjectId)
├── patient_id (String)
├── timestamp (Number)
├── neck (Number)
├── back (Number)
├── waist (Number)
├── left_shoulder (Number)
├── right_shoulder (Number)
├── bad_posture (Boolean)
├── created_at (Date)
└── updated_at (Date)
```

### Generated/Temporary

```
Cache:
├── .venv/ (Python virtual environment)
├── node_modules/ (NPM packages)
├── dist/ (Built React app)
├── build/ (Built Node.js)
└── __pycache__/ (Python compiled code)

Logs:
├── logs/ingestion.log
├── logs/api.log
└── logs/dashboard.log

Environment:
├── .env (Local values)
├── .env.local (Vite specific)
└── .env.production (Production values)
```

---

## 🛠️ Configuration Files

| File | Format | Purpose |
|------|--------|---------|
| `.env.example` | Key=Value | Template for all env vars |
| `package.json` | JSON | NPM/Node.js config |
| `vite.config.js` | JavaScript | Build configuration |
| `tailwind.config.js` | JavaScript | CSS framework config |
| `docker-compose.yml` | YAML | Container orchestration |
| `Dockerfile` | Text | Container image definition |

---

## 📖 Documentation Organization

```
docs/
├── ARCHITECTURE.md       # System design overview
├── ANALYTICS.md          # Calculations & formulas
├── INSTALLATION.md       # Setup instructions
│
├── api/
│   └── API_SPEC.md      # REST API reference
│
└── schemas/
    └── MONGODB_SCHEMA.md # Database design
```

**Reading Order:**
1. Start: `README.md` (Overview)
2. Quick: `QUICK_START.md` (5-min setup)
3. Setup: `docs/INSTALLATION.md` (Detailed)
4. Reference: `docs/api/API_SPEC.md` (API)
5. Deep: `docs/ARCHITECTURE.md` (Design)

---

## 🎯 File Relationships

```
ESP32
  ↓ JSON
Ingestion Server (main.py)
  ↓ (HTTP request)
MongoDB (data stored)
  ↓ (Query)
API Server (server.js)
  ↓ (REST API)
React Components (*.jsx)
  ↓ (Recharts, Three.js)
Browser Display
```

---

## ✅ Checklist Before Deployment

- [ ] All `.env.example` files have `.env` created
- [ ] MongoDB Atlas cluster exists and credentials work
- [ ] ESP32 is running and accessible
- [ ] Dependencies installed: `npm install`, `pip install -r requirements.txt`
- [ ] Documentation reviewed: `QUICK_START.md`
- [ ] Logs directory created: `mkdir logs`
- [ ] Docker images built (if using Docker)
- [ ] Health endpoints tested: `/health`, `/api/health`
- [ ] Sample data ingested successfully
- [ ] Dashboard renders without errors
- [ ] PDF export working
- [ ] HTTPS configured (production)

---

## 📞 Quick Reference

### File Locations

| Need | File | Type |
|------|------|------|
| Change polling interval | `.env` | Config |
| Add new API endpoint | `src/server.js` | Code |
| Modify dashboard layout | `Dashboard.jsx` | Component |
| Update colors/theme | `index.css` | Style |
| See MongoDB schema | `MONGODB_SCHEMA.md` | Doc |
| Understand logic flow | `ARCHITECTURE.md` | Doc |

### Key Commands

```bash
# Ingestion
python main.py                    # Run server
curl http://localhost:8000/health # Check health

# API
npm run dev                       # Development
npm run start                     # Production

# Dashboard
npm run dev                       # Development
npm run build                     # Production build

# All services
./start.sh                        # macOS/Linux
.\start.bat                       # Windows
docker-compose up                 # Docker
```

---

**Version**: 1.0  
**Total Files**: 24  
**Total Lines**: ~6,400  
**Updated**: February 2026
