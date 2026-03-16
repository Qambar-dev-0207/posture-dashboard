# MongoDB Schema Documentation

## Database: `posture`

### Collection: `posture_data`

Core collection for storing patient posture measurements.

#### Schema

```json
{
  "_id": ObjectId,
  "patient_id": String,
  "timestamp": Number (milliseconds since epoch),
  "neck": Number (degrees, 0-25),
  "back": Number (degrees, 0-30),
  "waist": Number (degrees, 0-20),
  "left_shoulder": Number (degrees, 0-45),
  "right_shoulder": Number (degrees, 0-45),
  "bad_posture": Boolean,
  "created_at": Date,
  "updated_at": Date
}
```

#### Field Descriptions

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `_id` | ObjectId | - | MongoDB auto-generated ID |
| `patient_id` | String | - | Unique patient identifier (e.g., "P001", "patient_001") |
| `timestamp` | Number | - | Unix timestamp in milliseconds |
| `neck` | Number | 0-25° | Neck angle deviation from ideal |
| `back` | Number | 0-30° | Back curvature deviation |
| `waist` | Number | 0-20° | Waist angle deviation |
| `left_shoulder` | Number | 0-45° | Left shoulder angle deviation |
| `right_shoulder` | Number | 0-45° | Right shoulder angle deviation |
| `bad_posture` | Boolean | true/false | Flag if posture is poor |
| `created_at` | Date | - | Record creation timestamp |
| `updated_at` | Date | - | Last update timestamp |

#### Sample Document

```json
{
  "_id": ObjectId("65c8f7a1b2c3d4e5f6g7h8i9"),
  "patient_id": "patient_001",
  "timestamp": 1707484800000,
  "neck": 12,
  "back": 5,
  "waist": 3,
  "left_shoulder": 18,
  "right_shoulder": 20,
  "bad_posture": false,
  "created_at": ISODate("2024-02-09T10:00:00.000Z"),
  "updated_at": ISODate("2024-02-09T10:00:00.000Z")
}
```

### Indexes

```javascript
// Index for fast queries by patient and date
db.posture_data.createIndex({
  "patient_id": 1,
  "timestamp": -1
}, { name: "idx_patient_timestamp" });

// Index for filtering bad posture events
db.posture_data.createIndex({
  "patient_id": 1,
  "bad_posture": 1,
  "timestamp": -1
}, { name: "idx_patient_bad_posture" });

// TTL index: auto-delete records after 90 days (optional)
db.posture_data.createIndex(
  { "created_at": 1 },
  { expireAfterSeconds: 7776000 }
);
```

### Aggregation Pipelines

#### Daily Average Deviation

```javascript
db.posture_data.aggregate([
  {
    $match: {
      "patient_id": "patient_001",
      "timestamp": {
        $gte: 1707331200000,  // Start of day
        $lt: 1707417600000    // End of day
      }
    }
  },
  {
    $group: {
      _id: "$patient_id",
      avg_neck: { $avg: "$neck" },
      avg_back: { $avg: "$back" },
      avg_waist: { $avg: "$waist" },
      avg_left_shoulder: { $avg: "$left_shoulder" },
      avg_right_shoulder: { $avg: "$right_shoulder" },
      bad_posture_count: { $sum: { $cond: ["$bad_posture", 1, 0] } },
      total_records: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      avg_neck: { $round: ["$avg_neck", 2] },
      avg_back: { $round: ["$avg_back", 2] },
      avg_waist: { $round: ["$avg_waist", 2] },
      avg_left_shoulder: { $round: ["$avg_left_shoulder", 2] },
      avg_right_shoulder: { $round: ["$avg_right_shoulder", 2] },
      bad_posture_percentage: {
        $round: [{ $multiply: [{ $divide: ["$bad_posture_count", "$total_records"] }, 100] }, 2]
      },
      total_records: 1
    }
  }
]);
```

#### Worst Posture Area

```javascript
db.posture_data.aggregate([
  {
    $match: {
      "patient_id": "patient_001",
      "timestamp": {
        $gte: 1707331200000,
        $lt: 1707417600000
      }
    }
  },
  {
    $group: {
      _id: null,
      avg_neck: { $avg: "$neck" },
      avg_back: { $avg: "$back" },
      avg_waist: { $avg: "$waist" },
      avg_left_shoulder: { $avg: "$left_shoulder" },
      avg_right_shoulder: { $avg: "$right_shoulder" }
    }
  },
  {
    $project: {
      worst_area: {
        $cond: [
          { $gte: ["$avg_neck", { $max: ["$avg_back", "$avg_waist", "$avg_left_shoulder", "$avg_right_shoulder"] }] },
          "neck",
          {
            $cond: [
              { $gte: ["$avg_back", { $max: ["$avg_waist", "$avg_left_shoulder", "$avg_right_shoulder"] }] },
              "back",
              {
                $cond: [
                  { $gte: ["$avg_waist", { $max: ["$avg_left_shoulder", "$avg_right_shoulder"] }] },
                  "waist",
                  { $cond: [{ $gte: ["$avg_left_shoulder", "$avg_right_shoulder"] }, "left_shoulder", "right_shoulder"] }
                ]
              }
            ]
          }
        ]
      },
      max_deviation: {
        $max: ["$avg_neck", "$avg_back", "$avg_waist", "$avg_left_shoulder", "$avg_right_shoulder"]
      }
    }
  }
]);
```

#### Hourly Breakdown

```javascript
db.posture_data.aggregate([
  {
    $match: {
      "patient_id": "patient_001",
      "timestamp": {
        $gte: 1707331200000,  // Start of day
        $lt: 1707417600000
      }
    }
  },
  {
    $group: {
      _id: {
        $toDate: {
          $subtract: [
            { $toLong: "$timestamp" },
            { $mod: [{ $toLong: "$timestamp" }, 3600000] }
          ]
        }
      },
      avg_neck: { $avg: "$neck" },
      avg_back: { $avg: "$back" },
      avg_waist: { $avg: "$waist" },
      bad_posture_count: { $sum: { $cond: ["$bad_posture", 1, 0] } },
      total_records: { $sum: 1 }
    }
  },
  { $sort: { "_id": 1 } }
]);
```

### Collection: `patient_profiles` (Optional)

Store patient metadata and settings.

```json
{
  "_id": ObjectId,
  "patient_id": String,
  "name": String,
  "age": Number,
  "gender": String,
  "device_id": String,
  "email": String,
  "created_at": Date,
  "ideal_angles": {
    "neck": Number,
    "back": Number,
    "waist": Number,
    "left_shoulder": Number,
    "right_shoulder": Number
  },
  "monitoring_start_date": Date,
  "active": Boolean
}
```

### Collection: `daily_reports` (Optional)

Cache aggregated daily data for faster retrieval.

```json
{
  "_id": ObjectId,
  "patient_id": String,
  "date": Date,
  "avg_neck": Number,
  "avg_back": Number,
  "avg_waist": Number,
  "avg_left_shoulder": Number,
  "avg_right_shoulder": Number,
  "bad_posture_percentage": Number,
  "total_records": Number,
  "worst_area": String,
  "improvement_percentage": Number,
  "created_at": Date
}
```

## Connection String

```
mongodb+atlas://username:password@cluster.mongodb.net/posture?retryWrites=true&w=majority
```

## Usage Notes

1. **Timestamps**: Always use milliseconds since epoch for consistency
2. **Angle Values**: All angles in degrees (0-360)
3. **Patient ID**: Use consistent format: "patient_001", "P001", etc.
4. **Data Retention**: Set TTL indexes for GDPR compliance (optional)
5. **Indexing**: Critical for production - especially patient_id + timestamp

---

**Version**: 1.0  
**Last Updated**: February 2026
