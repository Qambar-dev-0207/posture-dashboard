import React from 'react'

export default function ImprovementCard({ improvementData }) {
  if (!improvementData) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const improvement = improvementData.improvement_percentage || 0
  const isImproving = improvement > 0

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h5 className="font-bold text-white flex items-center gap-2">
          <i className="bi bi-graph-up-arrow text-primary-400"></i>
          Performance Delta
        </h5>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 rounded-xl bg-surface/50 border border-white/5 relative group">
            <h6 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Yesterday</h6>
            <h3 className="text-3xl font-mono font-bold text-white group-hover:text-primary-400 transition-colors">
              {improvementData.yesterday_avg_deviation?.toFixed(2)}°
            </h3>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-1/3 bg-primary-500/30"></div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-surface/50 border border-white/5 relative group">
            <h6 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Today</h6>
            <h3 className="text-3xl font-mono font-bold text-primary-400 group-hover:text-primary-300 transition-colors">
              {improvementData.today_avg_deviation?.toFixed(2)}°
            </h3>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-1/3 bg-primary-500"></div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-surface/50 border border-white/5 relative group">
            <h6 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Net Change</h6>
            <h3 className={`text-3xl font-mono font-bold ${isImproving ? 'text-success' : 'text-danger'}`}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}%
            </h3>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-1/3 ${isImproving ? 'bg-success' : 'bg-danger'}`}></div>
          </div>
        </div>

        {/* Progress Alert */}
        <div className={`rounded-xl p-5 flex items-start gap-4 border backdrop-blur-md ${
          isImproving 
            ? 'bg-success/10 border-success/20 shadow-neon-green' 
            : 'bg-warning/10 border-warning/20'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isImproving ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            <i className={`bi ${isImproving ? 'bi-check-lg' : 'bi-exclamation-lg'} text-xl`}></i>
          </div>
          <div>
            <h4 className={`font-bold text-lg mb-1 ${isImproving ? 'text-success' : 'text-warning'}`}>
              {isImproving ? 'Protocol Adherence Detected' : 'Deviation Alert'}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isImproving
                ? 'Patient is demonstrating improved biomechanical alignment compared to previous baseline. Continue current monitoring protocol.'
                : 'Significant postural regression detected. Recommend immediate ergonomic intervention and posture reset exercises.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
