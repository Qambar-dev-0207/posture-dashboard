import os
import random
from datetime import datetime
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Posture Data Ingestion Server",
    description="Polls ESP32 API (or simulates data) and stores to MongoDB",
    version="1.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/posture")
ESP32_API_URL = os.getenv("ESP32_API_URL", "http://localhost/api/posture") # Default to dummy
PATIENT_ID = os.getenv("PATIENT_ID", "patient_001")
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL", "5"))
SIMULATION_MODE = os.getenv("SIMULATION_MODE", "false").lower() == "true"

# MongoDB client
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client["posture"]
    collection = db["posture_data"]
except Exception as e:
    logger.warning(f"⚠️ MongoDB not connected immediately: {e}")
    mongo_client = None
    collection = None

# Scheduler
scheduler = BackgroundScheduler()

# Create indexes
def create_indexes():
    """Create MongoDB indexes for optimal queries"""
    if collection is None:
        return
    try:
        collection.create_index([("patient_id", 1), ("timestamp", -1)])
        collection.create_index([("patient_id", 1), ("bad_posture", 1), ("timestamp", -1)])
        logger.info("✅ MongoDB indexes created successfully")
    except Exception as e:
        logger.error(f"❌ Error creating indexes: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    try:
        if mongo_client:
            # Verify MongoDB connection
            try:
                mongo_client.admin.command('ping')
                logger.info("✅ Connected to MongoDB")
                create_indexes()
            except Exception as e:
                logger.error(f"❌ MongoDB connection failed: {e}")
        
        # Start scheduler
        scheduler.add_job(
            poll_esp32,
            'interval',
            seconds=POLL_INTERVAL_SECONDS,
            id='poll_esp32_job'
        )
        scheduler.start()
        mode_str = "SIMULATION" if SIMULATION_MODE else "LIVE"
        logger.info(f"✅ Scheduler started - {mode_str} MODE - polling every {POLL_INTERVAL_SECONDS}s")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("✅ Scheduler shut down")
    if mongo_client:
        mongo_client.close()
        logger.info("✅ MongoDB connection closed")

# Register shutdown handler
atexit.register(shutdown_event)

def generate_simulation_data():
    """Generate realistic random posture data"""
    # Base values (good posture)
    base_neck = 10
    base_back = 5
    base_waist = 2
    base_shoulder = 5
    
    # Add noise
    neck = base_neck + random.uniform(-5, 15)
    back = base_back + random.uniform(-2, 10)
    waist = base_waist + random.uniform(-1, 5)
    left_shoulder = base_shoulder + random.uniform(-2, 8)
    right_shoulder = base_shoulder + random.uniform(-2, 8)
    
    # Randomly simulate bad posture (20% chance)
    is_bad = False
    if random.random() < 0.2:
        is_bad = True
        neck += 20
        back += 15
        
    return {
        "neck": round(neck, 2),
        "back": round(back, 2),
        "waist": round(waist, 2),
        "left_shoulder": round(left_shoulder, 2),
        "right_shoulder": round(right_shoulder, 2),
        "bad_posture": is_bad
    }

def poll_esp32():
    """Poll ESP32 API or generate simulation data"""
    try:
        if collection is None:
            logger.error("❌ MongoDB not connected, skipping data storage")
            return

        data = {}
        
        if SIMULATION_MODE:
            data = generate_simulation_data()
            logger.info(f"🔮 Generated Simulation Data: {data}")
        else:
            response = requests.get(ESP32_API_URL, timeout=5)
            response.raise_for_status()
            data = response.json()
        
        # Validate required fields (if not simulation, though simulation guarantees them)
        if not SIMULATION_MODE:
            required_fields = ["neck", "back", "waist", "left_shoulder", "right_shoulder"]
            if not all(field in data for field in required_fields):
                logger.warning(f"⚠️ Missing required fields in ESP32 response: {data}")
                return
        
        # Prepare document for MongoDB
        document = {
            "patient_id": PATIENT_ID,
            "timestamp": int(datetime.now().timestamp() * 1000),  # milliseconds
            "neck": float(data.get("neck", 0)),
            "back": float(data.get("back", 0)),
            "waist": float(data.get("waist", 0)),
            "left_shoulder": float(data.get("left_shoulder", 0)),
            "right_shoulder": float(data.get("right_shoulder", 0)),
            "bad_posture": bool(data.get("bad_posture", False)),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into MongoDB
        result = collection.insert_one(document)
        logger.info(f"✅ Data stored - ID: {result.inserted_id}")
        
    except requests.exceptions.Timeout:
        logger.warning(f"⚠️ ESP32 API timeout: {ESP32_API_URL}")
    except requests.exceptions.RequestException as e:
        logger.warning(f"⚠️ ESP32 API error: {e}")
    except Exception as e:
        logger.error(f"❌ Polling error: {e}")

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "running",
        "service": "Posture Data Ingestion Server",
        "esp32_api": ESP32_API_URL,
        "patient_id": PATIENT_ID,
        "poll_interval_seconds": POLL_INTERVAL_SECONDS,
        "mongodb": "connected" if mongo_client else "disconnected"
    }

@app.get("/health")
async def health():
    """Health status endpoint"""
    try:
        # Verify MongoDB
        mongo_client.admin.command('ping')
        
        return {
            "status": "healthy",
            "mongodb": "connected",
            "scheduler": "running" if scheduler.running else "stopped"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.get("/stats")
async def stats():
    """Get ingestion statistics"""
    try:
        total_records = collection.count_documents({"patient_id": PATIENT_ID})
        bad_posture_count = collection.count_documents({
            "patient_id": PATIENT_ID,
            "bad_posture": True
        })
        
        latest = collection.find_one(
            {"patient_id": PATIENT_ID},
            sort=[("timestamp", -1)]
        )
        
        return {
            "patient_id": PATIENT_ID,
            "total_records": total_records,
            "bad_posture_records": bad_posture_count,
            "bad_posture_percentage": round((bad_posture_count / total_records * 100) if total_records > 0 else 0, 2),
            "latest_reading": {
                "timestamp": latest.get("timestamp") if latest else None,
                "neck": latest.get("neck") if latest else None,
                "back": latest.get("back") if latest else None,
                "waist": latest.get("waist") if latest else None,
            } if latest else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/manual-ingest")
async def manual_ingest(data: dict):
    """Manually ingest posture data (for testing)"""
    try:
        document = {
            "patient_id": data.get("patient_id", PATIENT_ID),
            "timestamp": int(data.get("timestamp", datetime.now().timestamp() * 1000)),
            "neck": float(data.get("neck", 0)),
            "back": float(data.get("back", 0)),
            "waist": float(data.get("waist", 0)),
            "left_shoulder": float(data.get("left_shoulder", 0)),
            "right_shoulder": float(data.get("right_shoulder", 0)),
            "bad_posture": bool(data.get("bad_posture", False)),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = collection.insert_one(document)
        return {
            "status": "success",
            "inserted_id": str(result.inserted_id),
            "message": "Data manually ingested"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
