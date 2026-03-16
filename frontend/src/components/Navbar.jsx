import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ apiStatus, patientId, onPatientIdChange }) {
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [tempPatientId, setTempPatientId] = useState(patientId)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const handleSave = () => {
    onPatientIdChange(tempPatientId)
    setShowPatientModal(false)
  }

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 group ${
          isActive 
            ? 'text-emerald-400 bg-emerald-500/10' 
            : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'
        }`}
      >
        <i className={`bi bi-${icon} me-2 text-lg transition-transform group-hover:scale-110`}></i>
        <span className="font-semibold">{label}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        )}
      </Link>
    )
  }

  return (
    <>
      <nav className="sticky top-4 z-50 px-4 mb-4">
        <div className="container mx-auto max-w-7xl bg-zinc-900/70 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-glass">
          <div className="flex justify-between items-center h-20 px-6">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-emerald-500/40 transition-all duration-500">
                <i className="bi bi-heart-pulse-fill text-white text-xl"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Posture<span className="font-light text-zinc-500">Pro</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase font-bold">Medical Diagnostics</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5">
              <NavItem to="/" icon="grid-1x2-fill" label="Dashboard" />
              <NavItem to="/analytics" icon="bar-chart-line-fill" label="Analytics" />
              <NavItem to="/reports" icon="file-earmark-medical-fill" label="Reports" />
              <NavItem to="/settings" icon="gear-wide-connected" label="Settings" />
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-950/50 border border-white/5 shadow-inner">
                <div className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{apiStatus}</span>
              </div>

              <div className="h-8 w-px bg-white/5"></div>

              {/* Patient Profile */}
              <button 
                onClick={() => setShowPatientModal(true)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-800 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                    <i className="bi bi-person-fill text-zinc-400 group-hover:text-emerald-400 transition-colors"></i>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Active Patient</p>
                  <p className="text-sm font-mono font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors tracking-tighter">{patientId}</p>
                </div>
                <i className="bi bi-chevron-down text-[10px] text-zinc-600 group-hover:translate-y-0.5 transition-transform"></i>
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-slate-300 hover:text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="bi bi-list text-2xl"></i>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-2 animate-fade-in">
              <NavItem to="/" icon="speedometer2" label="Dashboard" />
              <NavItem to="/analytics" icon="graph-up" label="Analytics" />
              <NavItem to="/reports" icon="file-earmark-pdf" label="Reports" />
              <NavItem to="/settings" icon="gear" label="Settings" />
            </div>
          )}
        </div>
      </nav>

      {/* Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-0 overflow-hidden scale-100 animate-fade-in">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h5 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="bi bi-person-badge text-primary-500"></i>
                Switch Patient Profile
              </h5>
              <button
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowPatientModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-8">
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Patient ID</label>
              <div className="relative">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                  type="text"
                  className="input-cyber w-full pl-10 text-lg font-mono"
                  value={tempPatientId}
                  onChange={(e) => setTempPatientId(e.target.value)}
                  placeholder="Enter ID..."
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-2">
                <i className="bi bi-info-circle"></i>
                Changing ID will reload dashboard metrics immediately.
              </p>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
              <button
                className="btn-cyber-outline"
                onClick={() => setShowPatientModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-cyber"
                onClick={handleSave}
              >
                <i className="bi bi-check-lg"></i>
                Load Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
