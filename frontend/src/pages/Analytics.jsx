import React, { useState, useEffect } from 'react'
import { getImprovement, getWorstArea } from '../utils/api'

export default function Analytics({ patientId }) {
  const [improvementData, setImprovementData] = useState(null)
  const [worstAreaData, setWorstAreaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [improvement, worstArea] = await Promise.all([
          getImprovement(patientId),
          getWorstArea(new Date().toISOString().split('T')[0], patientId),
        ])
        setImprovementData(improvement.data)
        setWorstAreaData(worstArea.data)
      } catch (err) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [patientId])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="bi bi-graph-up text-blue-500"></i>
          Advanced Analytics
        </h1>
        <p className="text-slate-400">Detailed analysis and posture trends for medical oversight</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
          <i className="bi bi-exclamation-circle text-xl"></i>
          <div>
            <strong className="block font-semibold">Error</strong>
            <span className="text-sm opacity-90">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Processing analytics data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Analysis */}
          {improvementData && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <i className="bi bi-activity text-primary-400"></i>
                  Progress Analysis
                </h5>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 text-center relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-slate-700"></div>
                  <div>
                    <h6 className="text-slate-500 text-sm mb-2 uppercase tracking-wider font-bold">Yesterday</h6>
                    <h3 className="text-3xl font-mono font-bold text-white">{improvementData.yesterday_avg_deviation?.toFixed(2)}°</h3>
                  </div>
                  <div>
                    <h6 className="text-slate-500 text-sm mb-2 uppercase tracking-wider font-bold">Today</h6>
                    <h3 className="text-3xl font-mono font-bold text-primary-400">{improvementData.today_avg_deviation?.toFixed(2)}°</h3>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                  <div className="inline-block px-4 py-1 rounded-full bg-surface border border-slate-700 text-slate-400 text-xs mb-4 uppercase tracking-widest font-bold">
                    Performance Delta
                  </div>
                  <h2 className={`text-5xl font-mono font-extrabold mb-2 ${
                    improvementData.improvement_percentage >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {improvementData.improvement_percentage > 0 ? '+' : ''}
                    {improvementData.improvement_percentage?.toFixed(2)}%
                  </h2>
                  <p className="text-slate-500 text-sm">Improvement relative to previous monitoring period</p>
                </div>

                <div className={`mt-8 p-4 rounded-xl border flex items-center gap-4 ${
                  improvementData.improvement_percentage >= 0 
                    ? 'bg-success/5 border-success/20 text-success' 
                    : 'bg-danger/5 border-danger/20 text-danger'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    improvementData.improvement_percentage >= 0 ? 'bg-success/20' : 'bg-danger/20'
                  }`}>
                    <i className={`bi bi-${improvementData.improvement_percentage >= 0 ? 'shield-check' : 'shield-exclamation'} text-xl`}></i>
                  </div>
                  <div>
                    <span className="font-bold block">Status Summary</span>
                    <span className="text-sm opacity-80">
                      {improvementData.improvement_percentage > 0 
                        ? 'Clinical targets met. Posture is showing significant improvement.' 
                        : 'Deviation levels increased. Correction protocols recommended.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Focus Areas */}
          {worstAreaData && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <i className="bi bi-bullseye text-warning"></i>
                  Clinical Focus Areas
                </h5>
              </div>
              <div className="p-8 space-y-8">
                <div className="bg-surface p-6 rounded-2xl border border-white/5 relative group hover:border-warning/30 transition-colors">
                   <div className="absolute top-4 right-4 text-slate-800 text-6xl font-black opacity-20 group-hover:opacity-30 transition-opacity">01</div>
                   <h6 className="text-slate-500 text-sm mb-4 uppercase tracking-wider font-bold">Critical Area Detection</h6>
                   <div className="flex items-end gap-4">
                     <h2 className="text-4xl font-bold text-warning capitalize">{worstAreaData.worst_area}</h2>
                     <div className="mb-1 text-slate-500">
                       Area of maximum recorded deviation
                     </div>
                   </div>
                   <div className="mt-4 flex items-center gap-2">
                     <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-warning w-3/4 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                     </div>
                     <span className="text-warning font-mono text-sm font-bold">{worstAreaData.max_deviation}°</span>
                   </div>
                </div>

                <div className="glass-card bg-primary-500/5 border-primary-500/20 p-6">
                   <h6 className="text-primary-400 text-sm font-bold mb-3 flex items-center gap-2">
                     <i className="bi bi-lightbulb"></i>
                     CLINICAL RECOMMENDATION
                   </h6>
                   <p className="text-slate-300 leading-relaxed">
                     Patient exhibits persistent hyper-extension in the <span className="text-white font-bold capitalize">{worstAreaData.worst_area}</span> area. 
                     Recommend hourly postural reset exercises and ergonomic adjustment of workspace interface. 
                     Focus on maintaining core engagement to stabilize the {worstAreaData.worst_area} alignment.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
