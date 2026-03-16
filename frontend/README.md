# Posture Dashboard Frontend

React-based medical-grade posture monitoring dashboard.

## Features

- 📊 Daily/Hourly deviation analytics
- 📈 Charts (Radar, Bar, Area)
- 🧍 3D human posture visualization (Three.js)
- 📄 PDF report generation
- 📱 Responsive dark theme UI
- 🔄 Real-time 5-second refresh

## Setup

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000
```

## Components

- **Header** - Navigation and status
- **Dashboard** - Main page with date selection
- **DeviationCharts** - Recharts visualizations
- **Posture3D** - Three.js 3D model
- **ReportGenerator** - PDF export
- **ImprovementCard** - Progress metrics

## API Integration

Proxied to `http://localhost:5000` via vite.config.js
