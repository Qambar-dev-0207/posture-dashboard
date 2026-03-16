import React, { useState } from 'react';

const APP_NAME = '🧍 Posture Analytics';

export default function Header({ apiStatus, patientId, onPatientIdChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const statusConfig = {
    healthy: { color: 'from-green-400 to-emerald-400', text: 'Online', icon: '✓' },
    warning: { color: 'from-yellow-400 to-amber-400', text: 'Degraded', icon: '⚠' },
    error: { color: 'from-red-400 to-rose-400', text: 'Offline', icon: '✕' },
    checking: { color: 'from-blue-400 to-cyan-400', text: 'Checking', icon: '⟳' },
  };

  const status = statusConfig[apiStatus];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-900/80 to-slate-950/80">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-slate-900 px-3 py-2 rounded-xl">
                <span className="text-xl font-bold">🧍</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold gradient-text tracking-tight">
                {APP_NAME}
              </h1>
              <p className="text-xs text-white/50">Clinical Grade Monitoring</p>
            </div>
          </div>

          {/* Center - Patient ID */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass rounded-xl">
            <label className="text-sm font-medium text-white/70">Patient ID:</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => onPatientIdChange(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-white/40 focus:outline-none w-32 font-mono text-sm"
              placeholder="patient_001"
            />
          </div>

          {/* Right - Status & Actions */}
          <div className="flex items-center gap-4">
            {/* API Status */}
            <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl">
              <div className={`flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r ${status.color} ${apiStatus !== 'checking' ? '' : 'animate-spin'}`}>
                <span className="text-xs font-bold text-slate-900">{status.icon}</span>
              </div>
              <span className="text-sm font-medium hidden md:inline">
                API: <span className={`bg-gradient-to-r ${status.color} bg-clip-text text-transparent`}>{status.text}</span>
              </span>
            </div>

            {/* Help Button */}
            <button className="btn-secondary hidden sm:flex">
              <span className="text-base">?</span>
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 hover:bg-white/10 rounded-lg transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-2 sm:hidden animate-slide-down">
            <div className="flex items-center gap-2 px-3 py-2 glass rounded-lg">
              <span className="text-xs text-white/70">Patient:</span>
              <input
                type="text"
                value={patientId}
                onChange={(e) => onPatientIdChange(e.target.value)}
                className="bg-transparent border-0 text-white text-sm flex-1 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
