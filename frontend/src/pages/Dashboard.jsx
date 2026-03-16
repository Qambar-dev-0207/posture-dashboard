import React, { useState, useEffect } from 'react'
import {
  getDailyData,
  getHourlyData,
  getImprovement,
  getWorstArea,
} from '../utils/api'
import { formatDate } from '../utils/helpers'
import DeviationCharts from '../components/DeviationCharts'
import Posture3D from '../components/Posture3D'
import ImprovementCard from '../components/ImprovementCard'

export default function Dashboard({ patientId }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [dailyData, setDailyData] = useState(null)
  const [hourlyData, setHourlyData] = useState(null)
  const [improvementData, setImprovementData] = useState(null)
  const [worstAreaData, setWorstAreaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      // Don't set loading to true on every poll to avoid flashing
      if (!dailyData) setLoading(true)
      setError(null)

      try {
        const [daily, hourly, improvement, worstArea] = await Promise.all([
          getDailyData(selectedDate, patientId),
          getHourlyData(selectedDate, patientId),
          getImprovement(patientId),
          getWorstArea(selectedDate, patientId),
        ])

        setDailyData(daily.data)
        setHourlyData(hourly.data?.hourly_data || [])
        setImprovementData(improvement.data)
        setWorstAreaData(worstArea.data)
      } catch (err) {
        console.error(err)
        // Only show error if we don't have data yet
        if (!dailyData) setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [selectedDate, patientId])

  const handlePreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(formatDate(date))
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(formatDate(date))
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
          <i className="bi bi-activity text-9xl text-emerald-500"></i>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <i className="bi bi-heart-pulse-fill text-emerald-500 animate-pulse-slow"></i>
              <span className="text-gradient">Posture Analytics</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl">
              Precision clinical monitoring. Tracking real-time biomechanical alignment metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
            <button 
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
              onClick={handlePreviousDay} 
              title="Previous Day"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <div className="px-4 border-x border-white/5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-zinc-100 focus:ring-0 text-center font-mono font-bold tracking-wider outline-none cursor-pointer"
              />
            </div>
            <button 
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
              onClick={handleNextDay} 
              title="Next Day"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
          </div>
          <div>
            <strong className="block font-semibold text-lg">System Alert</strong>
            <span className="opacity-90">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !dailyData && (
        <div className="text-center py-32 animate-pulse">
          <div className="inline-block relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 mt-6 font-mono tracking-widest uppercase text-sm">Initializing Biosensors...</p>
        </div>
      )}

      {/* Main Content */}
      {(!loading || dailyData) && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Records */}
            <div className="glass-card glass-card-hover p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Data Samples</p>
                  <h2 className="text-3xl font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {dailyData?.total_records || 0}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-500 shadow-emerald-glow">
                  <i className="bi bi-database-fill text-emerald-400 text-xl"></i>
                </div>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-3/4 opacity-50" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Good Posture */}
            <div className="glass-card glass-card-hover p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Alignment Score</p>
                  <h2 className="text-3xl font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {dailyData?.good_posture_percentage || 0}%
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-500">
                  <i className="bi bi-shield-check-fill text-emerald-500 text-xl"></i>
                </div>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out relative shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${dailyData?.good_posture_percentage || 0}%` }}
                >
                </div>
              </div>
            </div>

            {/* Worst Area */}
            <div className="glass-card glass-card-hover p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Critical Zone</p>
                  <h3 className="text-2xl font-bold text-white group-hover:text-warning capitalize transition-colors tracking-tight">
                    {worstAreaData?.worst_area || 'None'}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center border border-warning/20 group-hover:border-warning/50 transition-all duration-500">
                  <i className="bi bi-exclamation-diamond-fill text-warning text-xl"></i>
                </div>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2 font-medium">
                <span className="font-mono text-warning bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">{worstAreaData?.max_deviation || 0}°</span> 
                <span>PEAK DEVIATION</span>
              </p>
            </div>

            {/* System Status */}
            <div className="glass-card glass-card-hover p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Telemetry Status</p>
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Online</h3>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-500">
                  <i className="bi bi-cpu-fill text-indigo-400 text-xl"></i>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono font-bold">
                ENCRYPTION: <span className="text-zinc-400">AES-256</span> | BUFFER: <span className="text-zinc-400">SYNCED</span>
              </p>
            </div>
          </div>

          {/* Improvement Card */}
          <ImprovementCard improvementData={improvementData} />

          {/* Charts & 3D Model Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DeviationCharts dailyData={dailyData} hourlyData={hourlyData} />
            </div>
            <div className="lg:col-span-1 h-full">
              <Posture3D deviations={dailyData} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
