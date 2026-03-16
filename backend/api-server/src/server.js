import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/posture';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
const mongoClient = new MongoClient(MONGODB_URI);

async function connectMongo() {
  try {
    await mongoClient.connect();
    db = mongoClient.db('posture');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('⚠️ Ensure MONGODB_URI is set in .env or MongoDB is running locally on port 27017');
    process.exit(1);
  }
}

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Posture Analytics API Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/data/daily/:date/:patientId',
      'GET /api/data/hourly/:date/:patientId',
      'GET /api/analytics/improvement/:patientId',
      'GET /api/analytics/worst-area/:date/:patientId',
      'GET /api/reports/:patientId/:date'
    ]
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await mongoClient.db('admin').command({ ping: 1 });
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

/**
 * GET /api/data/daily/:date/:patientId
 * Get daily average deviations
 * Example: /api/data/daily/2024-02-09/patient_001
 */
app.get('/api/data/daily/:date/:patientId', async (req, res) => {
  try {
    const { date, patientId } = req.params;
    
    // Parse date (YYYY-MM-DD)
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    const collection = db.collection('posture_data');
    const results = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: {
            $gte: startTimestamp,
            $lt: endTimestamp
          }
        }
      },
      {
        $group: {
          _id: '$patient_id',
          avg_neck: { $avg: '$neck' },
          avg_back: { $avg: '$back' },
          avg_waist: { $avg: '$waist' },
          avg_left_shoulder: { $avg: '$left_shoulder' },
          avg_right_shoulder: { $avg: '$right_shoulder' },
          bad_posture_count: { $sum: { $cond: ['$bad_posture', 1, 0] } },
          total_records: { $sum: 1 },
          max_neck: { $max: '$neck' },
          max_back: { $max: '$back' },
          max_waist: { $max: '$waist' },
          max_left_shoulder: { $max: '$left_shoulder' },
          max_right_shoulder: { $max: '$right_shoulder' }
        }
      },
      {
        $project: {
          _id: 0,
          patient_id: patientId,
          date: date,
          avg_neck: { $round: ['$avg_neck', 2] },
          avg_back: { $round: ['$avg_back', 2] },
          avg_waist: { $round: ['$avg_waist', 2] },
          avg_left_shoulder: { $round: ['$avg_left_shoulder', 2] },
          avg_right_shoulder: { $round: ['$avg_right_shoulder', 2] },
          max_neck: { $round: ['$max_neck', 2] },
          max_back: { $round: ['$max_back', 2] },
          max_waist: { $round: ['$max_waist', 2] },
          max_left_shoulder: { $round: ['$max_left_shoulder', 2] },
          max_right_shoulder: { $round: ['$max_right_shoulder', 2] },
          bad_posture_percentage: {
            $round: [{ $multiply: [{ $divide: ['$bad_posture_count', '$total_records'] }, 100] }, 2]
          },
          good_posture_percentage: {
            $round: [{ $multiply: [{ $divide: [{ $subtract: ['$total_records', '$bad_posture_count'] }, '$total_records'] }, 100] }, 2]
          },
          total_records: '$total_records'
        }
      }
    ]).toArray();
    
    if (results.length === 0) {
      return res.json({
        message: 'No data found for this date',
        patient_id: patientId,
        date: date
      });
    }
    
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data/hourly/:date/:patientId
 * Get hourly breakdown
 */
app.get('/api/data/hourly/:date/:patientId', async (req, res) => {
  try {
    const { date, patientId } = req.params;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const collection = db.collection('posture_data');
    const results = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: {
            $gte: startDate.getTime(),
            $lt: endDate.getTime()
          }
        }
      },
      {
        $group: {
          _id: {
            // Group by hour
            hour: {
              $floor: { $divide: ['$timestamp', 3600000] }
            }
          },
          hour_start: { $min: '$timestamp' },
          avg_neck: { $avg: '$neck' },
          avg_back: { $avg: '$back' },
          avg_waist: { $avg: '$waist' },
          avg_left_shoulder: { $avg: '$left_shoulder' },
          avg_right_shoulder: { $avg: '$right_shoulder' },
          bad_posture_count: { $sum: { $cond: ['$bad_posture', 1, 0] } },
          total_records: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hour: {
            $toDate: {
              $multiply: ['$_id.hour', 3600000]
            }
          },
          hour_start: { $toDate: '$hour_start' },
          avg_neck: { $round: ['$avg_neck', 2] },
          avg_back: { $round: ['$avg_back', 2] },
          avg_waist: { $round: ['$avg_waist', 2] },
          avg_left_shoulder: { $round: ['$avg_left_shoulder', 2] },
          avg_right_shoulder: { $round: ['$avg_right_shoulder', 2] },
          bad_posture_percentage: {
            $round: [{ $multiply: [{ $divide: ['$bad_posture_count', '$total_records'] }, 100] }, 2]
          },
          total_records: '$total_records'
        }
      },
      { $sort: { hour_start: 1 } }
    ]).toArray();
    
    res.json({
      patient_id: patientId,
      date: date,
      hourly_data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/improvement/:patientId
 * Get day-to-day improvement percentage
 */
app.get('/api/analytics/improvement/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const collection = db.collection('posture_data');
    
    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 86400000;
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.getTime();
    const yesterdayEnd = yesterdayStart + 86400000;
    
    const getTodayAvg = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: { $gte: todayStart, $lt: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          avg_total_deviation: {
            $avg: {
              $add: ['$neck', '$back', '$waist', '$left_shoulder', '$right_shoulder']
            }
          }
        }
      }
    ]).toArray();
    
    const getYesterdayAvg = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: { $gte: yesterdayStart, $lt: yesterdayEnd }
        }
      },
      {
        $group: {
          _id: null,
          avg_total_deviation: {
            $avg: {
              $add: ['$neck', '$back', '$waist', '$left_shoulder', '$right_shoulder']
            }
          }
        }
      }
    ]).toArray();
    
    const todayAvg = getTodayAvg[0]?.avg_total_deviation || 0;
    const yesterdayAvg = getYesterdayAvg[0]?.avg_total_deviation || 0;
    
    const improvement = yesterdayAvg > 0 
      ? ((yesterdayAvg - todayAvg) / yesterdayAvg) * 100 
      : 0;
    
    res.json({
      patient_id: patientId,
      today_avg_deviation: Math.round(todayAvg * 100) / 100,
      yesterday_avg_deviation: Math.round(yesterdayAvg * 100) / 100,
      improvement_percentage: Math.round(improvement * 100) / 100,
      status: improvement > 0 ? 'improving' : improvement < 0 ? 'degrading' : 'stable'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/worst-area/:date/:patientId
 * Get posture area with maximum deviation
 */
app.get('/api/analytics/worst-area/:date/:patientId', async (req, res) => {
  try {
    const { date, patientId } = req.params;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const collection = db.collection('posture_data');
    const results = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: {
            $gte: startDate.getTime(),
            $lt: endDate.getTime()
          }
        }
      },
      {
        $group: {
          _id: null,
          avg_neck: { $avg: '$neck' },
          avg_back: { $avg: '$back' },
          avg_waist: { $avg: '$waist' },
          avg_left_shoulder: { $avg: '$left_shoulder' },
          avg_right_shoulder: { $avg: '$right_shoulder' }
        }
      }
    ]).toArray();
    
    if (results.length === 0) {
      return res.json({ message: 'No data found' });
    }
    
    const data = results[0];
    const areas = {
      neck: data.avg_neck,
      back: data.avg_back,
      waist: data.avg_waist,
      left_shoulder: data.avg_left_shoulder,
      right_shoulder: data.avg_right_shoulder
    };
    
    const worstArea = Object.keys(areas).reduce((a, b) => 
      areas[a] > areas[b] ? a : b
    );
    
    res.json({
      patient_id: patientId,
      date: date,
      worst_area: worstArea,
      max_deviation: Math.round(areas[worstArea] * 100) / 100,
      all_areas: {
        neck: Math.round(areas.neck * 100) / 100,
        back: Math.round(areas.back * 100) / 100,
        waist: Math.round(areas.waist * 100) / 100,
        left_shoulder: Math.round(areas.left_shoulder * 100) / 100,
        right_shoulder: Math.round(areas.right_shoulder * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reports/:patientId/:date
 * Get comprehensive daily report
 */
app.get('/api/reports/:patientId/:date', async (req, res) => {
  try {
    const { patientId, date } = req.params;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    const collection = db.collection('posture_data');
    
    // Get today's data
    const todayData = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: { $gte: startTimestamp, $lt: endTimestamp }
        }
      },
      {
        $group: {
          _id: null,
          avg_neck: { $avg: '$neck' },
          avg_back: { $avg: '$back' },
          avg_waist: { $avg: '$waist' },
          avg_left_shoulder: { $avg: '$left_shoulder' },
          avg_right_shoulder: { $avg: '$right_shoulder' },
          bad_posture_count: { $sum: { $cond: ['$bad_posture', 1, 0] } },
          total_records: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Get yesterday's data for comparison
    const yesterday = new Date(startDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.getTime();
    const yesterdayEnd = yesterdayStart + 86400000;
    
    const yesterdayData = await collection.aggregate([
      {
        $match: {
          patient_id: patientId,
          timestamp: { $gte: yesterdayStart, $lt: yesterdayEnd }
        }
      },
      {
        $group: {
          _id: null,
          avg_neck: { $avg: '$neck' },
          avg_back: { $avg: '$back' },
          avg_waist: { $avg: '$waist' },
          avg_left_shoulder: { $avg: '$left_shoulder' },
          avg_right_shoulder: { $avg: '$right_shoulder' },
          bad_posture_count: { $sum: { $cond: ['$bad_posture', 1, 0] } },
          total_records: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const today = todayData[0];
    const yesterdayRecord = yesterdayData[0];
    
    if (!today) {
      return res.json({ message: 'No data found for this date' });
    }
    
    // Calculate improvement
    const yesterdayAvg = yesterdayRecord ? 
      (yesterdayRecord.avg_neck + yesterdayRecord.avg_back + yesterdayRecord.avg_waist + 
       yesterdayRecord.avg_left_shoulder + yesterdayRecord.avg_right_shoulder) / 5 : 0;
    const todayAvg = 
      (today.avg_neck + today.avg_back + today.avg_waist + 
       today.avg_left_shoulder + today.avg_right_shoulder) / 5;
    
    const improvement = yesterdayAvg > 0 
      ? ((yesterdayAvg - todayAvg) / yesterdayAvg) * 100 
      : 0;
    
    // Hours monitored
    const hoursMonitored = Math.floor(today.total_records / 12); // Assuming ~12 records per hour
    
    res.json({
      patient_id: patientId,
      date: date,
      report: {
        total_monitored_hours: hoursMonitored,
        total_records: today.total_records,
        good_posture_percentage: Math.round(
          ((today.total_records - today.bad_posture_count) / today.total_records) * 100 * 100
        ) / 100,
        bad_posture_percentage: Math.round(
          (today.bad_posture_count / today.total_records) * 100 * 100
        ) / 100,
        average_deviations: {
          neck: Math.round(today.avg_neck * 100) / 100,
          back: Math.round(today.avg_back * 100) / 100,
          waist: Math.round(today.avg_waist * 100) / 100,
          left_shoulder: Math.round(today.avg_left_shoulder * 100) / 100,
          right_shoulder: Math.round(today.avg_right_shoulder * 100) / 100
        },
        improvement_vs_yesterday: Math.round(improvement * 100) / 100,
        recommendation: improvement > 5 
          ? '✅ Great improvement! Keep up the good posture work.' 
          : improvement > 0 
          ? '👍 Good improvement! Continue monitoring.' 
          : improvement < -5 
          ? '⚠️ Posture degradation detected. Increase awareness.' 
          : '➡️ Stable posture. Maintain current habit tracking.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 API Server running at http://localhost:${PORT}`);
    console.log('📊 API Endpoints:');
    console.log('  GET /api/health');
    console.log('  GET /api/data/daily/:date/:patientId');
    console.log('  GET /api/data/hourly/:date/:patientId');
    console.log('  GET /api/analytics/improvement/:patientId');
    console.log('  GET /api/analytics/worst-area/:date/:patientId');
    console.log('  GET /api/reports/:patientId/:date\n');
  });
});

process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await mongoClient.close();
  process.exit(0);
});
