# Analytics Logic & Calculations

Technical documentation for posture analytics algorithms.

## Core Metrics

### Average Deviation

**Definition:** Mean angle deviation from ideal posture for each body area.

**Calculation:**
```
Avg Deviation = Sum of all angle measurements / Total number of measurements
```

**Example:**
```
Neck measurements on 2024-02-09:
[10°, 12°, 14°, 11°, 13°, 12°]

Average = (10 + 12 + 14 + 11 + 13 + 12) / 6 = 72 / 6 = 12°
```

**Body Areas Tracked:**
1. **Neck** (0-25° deviation)
   - Forward head posture
   - Lateral flexion

2. **Back** (0-30° deviation)
   - Thoracic spine curvature
   - Kyphosis measurement

3. **Waist** (0-20° deviation)
   - Lumbar spine curve
   - Pelvis tilt

4. **Left Shoulder** (0-45° deviation)
   - Shoulder elevation
   - Asymmetry indicator

5. **Right Shoulder** (0-45° deviation)
   - Shoulder elevation
   - Asymmetry indicator

---

### Daily Posture Quality

**Good Posture Percentage:**
```
Good % = (Records with bad_posture=false / Total records) × 100
```

**Bad Posture Percentage:**
```
Bad % = (Records with bad_posture=true / Total records) × 100
```

Where `bad_posture` flag is determined by:
```
bad_posture = true if ANY:
  - neck > 20°
  - back > 25°
  - waist > 15°
  - (|left_shoulder - right_shoulder| > 10°)  // shoulder asymmetry
```

---

### Day-to-Day Improvement

**Formula:**
```
Improvement % = ((Yesterday Avg Deviation - Today Avg Deviation) / Yesterday Avg) × 100
```

**Interpretation:**
- `> +5%` → Significant improvement
- `+1% to +5%` → Slight improvement
- `-1% to +1%` → Stable (no change)
- `-5% to -1%` → Slight degradation
- `< -5%` → Significant degradation

**Calculation Steps:**

1. Calculate average total deviation for yesterday:
```
Yesterday Total = (neck + back + waist + left_shoulder + right_shoulder) / 5
Yesterday Avg = Average of all Yesterday Total readings
```

2. Calculate average total deviation for today:
```
Today Total = (neck + back + waist + left_shoulder + right_shoulder) / 5
Today Avg = Average of all Today Total readings
```

3. Calculate improvement:
```
Improvement = ((Yesterday Avg - Today Avg) / Yesterday Avg) × 100
```

**Example:**
```
Yesterday Avg Deviation: 45.2°
Today Avg Deviation: 39.8°

Improvement = ((45.2 - 39.8) / 45.2) × 100 = 11.95%
Status: "Improving" ✅
```

---

### Worst Posture Area

**Identification:**
```
Worst Area = Area with maximum average deviation on given date
```

**Algorithm:**
```javascript
const areas = {
  neck: avgNeck,
  back: avgBack,
  waist: avgWaist,
  left_shoulder: avgLeftShoulder,
  right_shoulder: avgRightShoulder
};

worstArea = max(areas);  // Returns key with highest value
```

**Use Case:**
- Identify which body area needs most attention
- Guide physical therapy recommendations
- Track improvement of specific areas

---

### Hourly Breakdown

**Aggregation Strategy:**
- Group measurements by hour
- Calculate hourly averages
- Track bad posture frequency per hour

**Hourly Data:**
```json
{
  "hour": "2024-02-09T10:00:00Z",
  "avg_neck": 12.5,
  "avg_back": 5.3,
  "avg_waist": 3.1,
  "avg_left_shoulder": 18.2,
  "avg_right_shoulder": 19.8,
  "bad_posture_percentage": 22.5,
  "total_records": 100
}
```

**Insights:**
- Identify pattern of posture degradation (e.g., worse in afternoon)
- Correlate with work activities
- Optimize breaks and exercises

---

### Monitoring Hours

**Calculation:**
```
Monitored Hours = Total Records / Records Per Hour

Assuming 12 measurements per hour @ 5-second intervals:
Monitored Hours = Total Records / 12
```

**Example:**
```
Total Records: 1440
Monitored Hours = 1440 / 12 = 120 hours

Note: This is theoretical. Actual monitoring duration
depends on device usage patterns.
```

---

## Advanced Analytics

### Symmetry Analysis (Shoulders)

**Shoulder Asymmetry:**
```
Asymmetry = |Left Shoulder Average - Right Shoulder Average|

if Asymmetry > 10°:
  warning = "Shoulder asymmetry detected - recommend physical therapy"
```

**Clinical Significance:**
- Indicates uneven muscle development
- May lead to chronic pain
- Requires targeted exercises

---

### Posture Stability Index

**Definition:** Measure of how consistent posture is throughout the day.

**Calculation:**
```
Stability Index = 100 - Standard Deviation of hourly averages

Lower std dev = More stable posture = Higher score
```

**Example:**
```
Hourly averages: [12, 13, 12, 11, 12, 13, 12, 11]
Mean: 12.0
Std Dev: 0.756
Stability Index: 99.24 (Excellent stability)
```

---

### Peak Deviation Hours

**Identification:**
```
Find hours where bad_posture_percentage > average
```

**Use:**
- Identify high-risk times of day
- Correlate with activities
- Plan intervention timing

---

## Ideal Angles Reference

Based on clinical posture standards:

| Body Area | Ideal | Good | Fair | Poor | Critical |
|-----------|-------|------|------|------|----------|
| Neck | 0° | <5° | <10° | <20° | >20° |
| Back | 0° | <5° | <10° | <25° | >25° |
| Waist | 0° | <5° | <10° | <15° | >15° |
| Shoulders | ≈ Equal | <5° diff | <10° diff | <15° diff | >15° diff |

---

## Data Quality Filters

### Outlier Detection

Remove anomalies using:
```
if value > mean + (3 × std_dev) or value < mean - (3 × std_dev):
  flag as potential sensor error
  consider excluding from calculations
```

### Missing Data Handling

```
if no data for hour:
  use interpolation from adjacent hours
  OR mark as "No data" in report
```

### Sensor Calibration

ESP32 sensor output might require:
```
calibrated_value = raw_value + offset
OR
calibrated_value = raw_value × scale_factor
```

---

## Recommendations Engine

Based on daily metrics:

```
if goodPosturePercentage >= 80% AND improvementPercentage > 0:
  recommendation = "✅ Excellent! Keep up the great posture work."
  
elif goodPosturePercentage >= 60% AND improvementPercentage > 0:
  recommendation = "👍 Good improvement. Continue monitoring."
  
elif goodPosturePercentage < 50% AND improvementPercentage < -5:
  recommendation = "⚠️ Posture degradation detected. Increase awareness."
  
else:
  recommendation = "➡️ Stable posture. Maintain current habits."
```

---

## Performance Optimization

### Aggregation Pipeline

For large datasets, use MongoDB aggregation:

```javascript
db.collection.aggregate([
  { $match: { patient_id, timestamp: { $gte, $lt } } },
  { $group: { 
    _id: null,
    avg_neck: { $avg: "$neck" },
    // ...
  }}
])
```

**Benefits:**
- Server-side computation (faster)
- Reduces data transfer
- Handles large datasets efficiently

---

## Medical Considerations

⚠️ **Important Notes:**

1. **These calculations are NOT for medical diagnosis**
2. **Consult healthcare providers for clinical decisions**
3. **System is for monitoring/awareness only**
4. **Sensor accuracy depends on ESP32 calibration**
5. **Environmental factors may affect readings**

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Classification**: Research/Clinical Grade
