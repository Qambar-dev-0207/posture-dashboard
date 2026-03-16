import React from 'react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 border border-white/10 p-4 rounded-xl shadow-glass backdrop-blur-md">
        <p className="text-white font-bold mb-2 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-mono font-bold" style={{ color: entry.color }}>{entry.value}°</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DeviationCharts({ dailyData, hourlyData }) {
  if (!dailyData) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Prepare data
  const deviationData = [
    { area: 'Neck', value: dailyData.avg_neck || 0 },
    { area: 'Back', value: dailyData.avg_back || 0 },
    { area: 'Waist', value: dailyData.avg_waist || 0 },
    { area: 'L. Shoulder', value: dailyData.avg_left_shoulder || 0 },
    { area: 'R. Shoulder', value: dailyData.avg_right_shoulder || 0 },
  ]

  const hourlyChartData = (hourlyData || []).map((hour, idx) => ({
    hour: `${String(idx).padStart(2, '0')}:00`,
    neck: hour.avg_neck,
    back: hour.avg_back,
    waist: hour.avg_waist,
  }))

  const comparisonData = [
    { area: 'Neck', ideal: 0, actual: dailyData.avg_neck || 0 },
    { area: 'Back', ideal: 0, actual: dailyData.avg_back || 0 },
    { area: 'Waist', ideal: 0, actual: dailyData.avg_waist || 0 },
    { area: 'L. Shoulder', ideal: 0, actual: dailyData.avg_left_shoulder || 0 },
    { area: 'R. Shoulder', ideal: 0, actual: dailyData.avg_right_shoulder || 0 },
  ]

  const axisStyle = { fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h5 className="font-bold text-white flex items-center gap-2">
              <i className="bi bi-radar text-primary-400"></i>
              Daily Deviation Profile
            </h5>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={deviationData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }} />
                <PolarRadiusAxis angle={30} domain={[0, 45]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Deviation (°)"
                  dataKey="value"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontFamily: 'Inter', fontSize: '12px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h5 className="font-bold text-white flex items-center gap-2">
              <i className="bi bi-bar-chart text-success"></i>
              Ideal vs Actual Angles
            </h5>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="area" tick={axisStyle} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                <YAxis tick={axisStyle} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontFamily: 'Inter', fontSize: '12px' }} />
                <Bar dataKey="ideal" fill="#10b981" name="Ideal Target (0°)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#f43f5e" name="Recorded Avg" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      {hourlyChartData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h5 className="font-bold text-white flex items-center gap-2">
              <i className="bi bi-graph-up text-warning"></i>
              Hourly Trend Analysis
            </h5>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyChartData}>
                <defs>
                  <linearGradient id="colorNeck" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorBack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorWaist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" tick={axisStyle} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                <YAxis tick={axisStyle} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontFamily: 'Inter', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="neck"
                  stackId="1"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNeck)"
                  name="Neck"
                />
                <Area
                  type="monotone"
                  dataKey="back"
                  stackId="1"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBack)"
                  name="Back"
                />
                <Area
                  type="monotone"
                  dataKey="waist"
                  stackId="1"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWaist)"
                  name="Waist"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
