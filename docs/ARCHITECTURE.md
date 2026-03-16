# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     POSTURE ANALYTICS PLATFORM               │
│                     Clinical Grade System v1.0               │
└─────────────────────────────────────────────────────────────┘

                          ┌─────────────┐
                          │   ESP32     │
                          │  Wearable   │
                          │   Device    │
                          └──────┬──────┘
                                 │
                    JSON: {neck, back, waist...}
                                 │
                          ┌──────▼──────┐
                          │   Python    │
                       ╔══╡  FastAPI   ╞══╗
                       ║  │ Ingestion  │  ║
                       ║  │  Server    │  ║
                       ║  │  :8000     │  ║
                       ║  └────────────┘  ║
                       ║   • Polls every  ║
                       ║     5 seconds    ║
                       ║   • Validates    ║
                       ║   • Timestamps   ║
                       ║   • Stores data  ║
                       ║                  ║
                       ║  ┌────────────┐  ║
                       ║  │  MongoDB   │  ║
                       ║  │  Atlas     │  ║
                       ║  │  Database  │  ║
                       ║  └────────────┘  ║
                       ║                  ║
                       ║ posture_data:    ║
                       ║  • patient_id    ║
                       ║  • timestamp     ║
                       ║  • angles        ║
                       ║  • bad_posture   ║
                       ║                  ║
                       ║  ┌────────────┐  ║
                       ║  │   Node.js  │  ║
                       ║  │  Express   │  ║
                       ║  │   API      │  ║
                       ║  │  Server    │  ║
                       ║  │   :5000    │  ║
                       ║  └────────────┘  ║
                       ║                  ║
                       ║  REST Endpoints: ║
                       ║  • /daily/:date  ║
                       ║  • /hourly/:date ║
                       ║  • /improvement  ║
                       ║  • /worst-area   ║
                       ║  • /reports      ║
                       ║                  ║
                       ║  Aggregations:   ║
                       ║  • Daily avg dev ║
                       ║  • Hourly breakdown
                       ║  • Improvement % ║
                       ║  • Worst area    ║
                       ║  • Recommendations
                       ║                  ║
                       ║  ┌────────────┐  ║
                       ║  │   React    │  ║
                       ║  │  Dashboard │  ║
                       ║  │  Vite      │  ║
                       ║  │  :5173     │  ║
                       ║  └────────────┘  ║
                       ║                  ║
                       ║  Components:     ║
                       ║  ✅ Charts       ║
                       ║     - Radar      ║
                       ║     - Bar        ║
                       ║     - Area       ║
                       ║  ✅ 3D Model    ║
                       ║  ✅ Reports     ║
                       ║  ✅ Improvement ║
                       ║                  ║
                       ║  Features:       ║
                       ║  • Real-time 5s  ║
                       ║  • Dark theme    ║
                       ║  • Responsive    ║
                       ║  • PDF export    ║
                       ║  • Date selector ║
                       ║                  ║
                       ║  Browser Display:║
                       ║  📊 Dashboards  ║
                       ║  📈 Analytics   ║
                       ║  🧍 3D Model    ║
                       ║  📄 Reports     ║
                       ║                  ║
                       ║  User Views      ║
                       ║  (Web Browser)   ║
                       ║                  ║
                       ╚══════════════════╝
```

---

## 📦 Data Flow

### Reading (User Viewing Dashboard)

```
User Browser
    ↓
[React Dashboard]
    ↓ GET /api/data/daily
[Node.js API]
    ↓
[MongoDB Query]
    ↓
[Aggregation Pipeline]
    ↓
JSON Response
    ↓
Charts & 3D Model Update
```

### Writing (ESP32 → Database)

```
ESP32 Sensor
    ↓ (POST JSON)
[Python Ingestion Server]
    ↓ (APScheduler every 5s)
[Validate & Timestamp]
    ↓
[MongoDB Insert]
    ↓
Database Updated
    ↓
Ready for API queries
```

---

## 🗄️ Database Schema Hierarchy

```
MongoDB Atlas (Cloud)
    │
    └── posture (Database)
            │
            ├── posture_data (Collection)
            │   ├── _id: ObjectId
            │   ├── patient_id: "patient_001"
            │   ├── timestamp: 1707484800000
            │   ├── neck: 12
            │   ├── back: 5
            │   ├── waist: 3
            │   ├── left_shoulder: 18
            │   ├── right_shoulder: 20
            │   ├── bad_posture: false
            │   └── created_at: Date
            │
            ├── Indexes:
            │   ├── (patient_id, timestamp) ← Fast daily queries
            │   ├── (patient_id, bad_posture, timestamp)
            │   └── TTL on created_at (90 days)
            │
            └── Aggregation Results:
                • Daily: avg per patient/date
                • Hourly: avg per patient/hour
                • Improvement: vs previous day
```

---

## 🔄 API Request Flow

### Example: Get Daily Report

```
1. Browser Request
   GET /api/data/daily/2024-02-09/patient_001
   
2. Node.js Server
   - Parse date: 2024-02-09 00:00 - 23:59
   - Build filter: {patient_id, timestamp: {$gte, $lt}}
   
3. MongoDB Aggregation
   $match → Filter documents
     ↓
   $group → Calculate averages
     ↓
   $project → Format response
   
4. Data Processing
   - Round to 2 decimals
   - Calculate percentages
   - Identify worst area
   
5. Response JSON
   {
     avg_neck: 12.35,
     avg_back: 5.67,
     bad_posture_percentage: 25.5,
     ...
   }
   
6. React renders charts
   from response data
```

---

## 🔐 Security Architecture

### Data Protection

```
┌─────────────────────────────────────────┐
│      HTTPS/TLS (In Transit)            │
│      • All API calls encrypted         │
│      • Browser ↔ Server                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    MongoDB Atlas Security               │
│      • IP Allowlist                    │
│      • Connection string auth          │
│      • Encrypted at rest (Atlas)       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    Application Layer                    │
│      • Input validation                │
│      • CORS enabled                    │
│      • Error handling                  │
│      • Logging                         │
└─────────────────────────────────────────┘
```

---

## ⚙️ Component Interactions

### Ingestion Server ↔ MongoDB

```
APScheduler (Every N seconds)
    ↓
poll_esp32()
    ↓
HTTP GET ESP32 IP
    ↓
Parse Response
    ↓
Validate Fields
    ↓
Add Timestamp & Patient ID
    ↓
collection.insert_one(document)
    ↓
Log Success/Error
```

### API Server ↔ Database

```
Express Route Handler
    ↓
Parse Parameters
    ↓
Build Aggregation Pipeline
    ↓
collection.aggregate([...])
    ↓
Execute on MongoDB Server
    ↓
Return Results
    ↓
Format JSON
    ↓
Send to Client
```

### Dashboard ↔ API

```
useEffect() Hook
    ↓ (Mounted & date changes)
api.getDailyData()
    ↓
axios.get('/api/data/daily/...')
    ↓
Parse Response
    ↓
setState()
    ↓ (Re-render)
Recharts receives data
    ↓
SVG Charts Rendered
```

---

## 🚀 Deployment Architecture

### Development

```
Local Machine
├── Terminal 1: python main.py (port 8000)
├── Terminal 2: npm run dev (port 5000)
├── Terminal 3: npm run dev (port 5173)
└── Browser: localhost:5173
```

### Production

```
Cloud Infrastructure
├── API Server
│   ├── Container (Docker)
│   ├── Load Balancer
│   └── Auto-scaling
├── Ingestion Server
│   ├── Container (Docker)
│   └── Auto-restart
├── Monitoring
│   ├── Logs
│   ├── Metrics
│   └── Alerts
└── Database
    ├── MongoDB Atlas
    ├── Backups
    └── Replication
```

---

## 📊 Data Processing Pipeline

### Real-Time Flow

```
                    Sensor Data
                         ↓
    ┌────────────────────┴────────────────────┐
    │                                         │
    ↓                                         ↓
[Ingestion]                            [Storage]
- Timestamp                            - MongoDB
- Validation                           - Indexed
- Transformation                       - Replicated
    ↓                                         ↑
    └────────────────────┬────────────────────┘
                         │
                    Database
                         ↓
    ┌────────────────────┴────────────────────┐
    │                                         │
    ↓                                         ↓
[Query API]                            [Aggregation]
- REST endpoints                       - Daily avg
- Real-time responses                  - Hourly breakdown
    ↓                                  - Improvement calc
    │                                         ↑
    └────────────────────┬────────────────────┘
                         │
                    Dashboard
                         ↓
    ┌────────────────────┴────────────────────┐
    │                                         │
    ↓                                         ↓
[Visualization]                        [Analytics]
- Recharts                             - Worst area
- 3D Model                             - Recommendations
- Reports                              - Insights
```

---

## 🧮 Analytics Processing

### Aggregation Pipeline Example (Daily)

```javascript
[
  // 1. FILTER: Only this patient today
  { $match: {
      patient_id: "patient_001",
      timestamp: { $gte: 1707331200000, $lt: 1707417600000 }
    }
  },
  
  // 2. GROUP: Calculate averages
  { $group: {
      _id: "$patient_id",
      avg_neck: { $avg: "$neck" },
      avg_back: { $avg: "$back" },
      bad_posture_count: { $sum: { $cond: ["$bad_posture", 1, 0] } },
      total_records: { $sum: 1 }
    }
  },
  
  // 3. PROJECT: Format response
  { $project: {
      avg_neck: { $round: ["$avg_neck", 2] },
      bad_posture_percentage: {
        $round: [
          { $multiply: [{ $divide: ["$bad_posture_count", "$total_records"] }, 100] },
          2
        ]
      },
      good_posture_percentage: { ... },
      total_records: 1
    }
  }
]
```

**On MongoDB Server** (efficient, server-side)

---

## 📱 Responsive Design

### Desktop (1280px+)

```
┌────────────────────────────────────────┐
│         Header (Fixed)                  │
├────────────┬─────────────────────────────┤
│ Metrics    │  Daily Charts (3 columns)   │
├────────────┴─────────────────────────────┤
│  3D Model  │  Report Generator          │
├────────────┴─────────────────────────────┤
│  Hourly Area Chart (Full Width)         │
└────────────────────────────────────────┘
```

### Tablet (768px-1279px)

```
┌────────────────────────────────────────┐
│         Header (Fixed)                  │
├────────────────────────────────────────┤
│  Metrics  │  Charts                    │
├────────────────────────────────────────┤
│  3D Model                              │
│  Report                                │
├────────────────────────────────────────┤
│  Hourly Chart                          │
└────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌────────────────────────────────────────┐
│     Header (Sticky)                    │
├────────────────────────────────────────┤
│  Metrics (Stack)                       │
├────────────────────────────────────────┤
│  Charts (50% width, scrollable)        │
├────────────────────────────────────────┤
│  3D Model                              │
├────────────────────────────────────────┤
│  Report                                │
├────────────────────────────────────────┤
│  Hourly (Horizontal scroll)            │
└────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Logging

### Health Checks

```
Ingestion Server: /health
    └─ MongoDB connectivity
    └─ Scheduler status
    └─ Latest reading

API Server: /api/health
    └─ Database connection
    └─ Query latency
    └─ Error rates

Dashboard: Network tab
    └─ API response times
    └─ Data freshness
    └─ Chart render performance
```

### Logging Strategy

```
Ingestion Server
    ├─ ✅ Success: "Data stored - ID: ..."
    ├─ ⚠️ Warning: "Missing fields..."
    └─ ❌ Error: "MongoDB connection failed"

API Server
    ├─ {timestamp} GET /api/data/daily
    ├─ {duration}ms
    └─ {statusCode}

Dashboard
    ├─ Browser console
    ├─ API errors caught
    └─ Network failures handled
```

---

## Performance Optimizations

### Database

```
✅ Indexes on (patient_id, timestamp)
✅ Aggregation on MongoDB server
✅ Connection pooling
✅ Query result caching (optional)
```

### API

```
✅ No N+1 queries
✅ Single aggregation call per endpoint
✅ Response compression
✅ CORS preflight caching
```

### Frontend

```
✅ React.lazy() for code splitting
✅ useEffect cleanup
✅ Memoization for expensive ops
✅ Chart library optimized rendering
✅ 3D model LOD (Level of Detail)
```

---

**Version**: 1.0  
**LastUpdated**: February 2026  
**Classification**: Clinical Research Grade
