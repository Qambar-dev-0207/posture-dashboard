import os
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
import dotenv

# Load environment variables
dotenv.load_dotenv('posture-platform/backend/api-server/.env')

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "posture"
COLLECTION_NAME = "posture_data"
PATIENT_ID = "patient_001"
NAME = "Shubham"

def seed_short_progression():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Clear existing data
        collection.delete_many({"patient_id": PATIENT_ID})
        print(f"Cleared existing records for {PATIENT_ID}")
        
        now = datetime.now()
        records = []
        
        # 20 minutes of data, one record every 30 seconds for higher granularity
        for i in range(40, -1, -1):
            timestamp = now - timedelta(seconds=i*30)
            minutes_ago = (i * 30) / 60
            
            # Default "Straight" values
            neck = 5 + random.uniform(-1, 1)
            back = 5 + random.uniform(-1, 1)
            waist = 2 + random.uniform(-0.5, 0.5)
            left_shoulder = 5 + random.uniform(-1, 1)
            right_shoulder = 5 + random.uniform(-1, 1)
            bad_posture = False
            
            # Phase 1: 20-15 mins ago -> All Straight (already set)
            
            # Phase 2: 15-10 mins ago -> Right hand (shoulder) bent
            if 10 <= minutes_ago < 15:
                right_shoulder = 38 + random.uniform(0, 5)
                bad_posture = True
            
            # Phase 3: 10-5 mins ago -> Left arm (shoulder) bent
            elif 5 <= minutes_ago < 10:
                right_shoulder = 38 + random.uniform(0, 5)
                left_shoulder = 38 + random.uniform(0, 5)
                bad_posture = True
                
            # Phase 4: 5-0 mins ago -> Head (neck) bent
            elif 0 <= minutes_ago < 5:
                right_shoulder = 38 + random.uniform(0, 5)
                left_shoulder = 38 + random.uniform(0, 5)
                neck = 24 + random.uniform(0, 3)
                bad_posture = True

            records.append({
                "patient_id": PATIENT_ID,
                "timestamp": int(timestamp.timestamp() * 1000),
                "neck": round(neck, 2),
                "back": round(back, 2),
                "waist": round(waist, 2),
                "left_shoulder": round(left_shoulder, 2),
                "right_shoulder": round(right_shoulder, 2),
                "bad_posture": bad_posture,
                "created_at": timestamp,
                "updated_at": timestamp
            })
        
        if records:
            collection.insert_many(records)
            print(f"Inserted {len(records)} high-granularity records.")
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_short_progression()
