import React, { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 5,
    theme: 'dark',
  })

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="bi bi-sliders text-blue-500"></i>
          System Settings
        </h1>
        <p className="text-slate-400">Configure dashboard behavior and monitoring parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
              <h5 className="font-bold text-white flex items-center gap-2">
                <i className="bi bi-gear text-blue-400"></i>
                General Configuration
              </h5>
            </div>
            <div className="p-6 space-y-8">
              {/* Notifications */}
              <div className="flex items-center justify-between group">
                <div>
                  <h6 className="font-bold text-white group-hover:text-blue-400 transition-colors">Posture Alerts</h6>
                  <p className="text-sm text-slate-500">Receive real-time notifications for bad posture detection</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="h-px bg-slate-700/50"></div>

              {/* Auto Refresh */}
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div>
                    <h6 className="font-bold text-white group-hover:text-blue-400 transition-colors">Real-time Polling</h6>
                    <p className="text-sm text-slate-500">Automatically synchronize dashboard with ingestion server</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoRefresh}
                      onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {settings.autoRefresh && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 animate-slide-down">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sync Interval (seconds)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="60"
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        value={settings.refreshInterval}
                        onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                      />
                      <span className="w-12 text-center font-mono text-blue-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        {settings.refreshInterval}s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-700/50"></div>

              {/* Theme */}
              <div className="group">
                <label className="block font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Interface Theme</label>
                <select
                  className="input w-full bg-slate-900 border-slate-700 text-slate-300"
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="light">Clinical Light (Legacy)</option>
                  <option value="dark">Pro Dark (Current)</option>
                  <option value="auto">System Adaptive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-6 flex gap-4">
                <button 
                  className="btn btn-primary px-8"
                  onClick={handleSave}
                >
                  <i className="bi bi-cloud-check text-lg"></i>
                  Commit Changes
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left"></i>
                  Return
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-violet-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
                 <i className="bi bi-shield-check text-3xl text-white"></i>
              </div>
              <h5 className="font-bold text-white">System Integrity</h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Core Engine</span>
                  <span className="text-white font-mono">v1.1.0-SIM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Build Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">Stable</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Security Patch</span>
                  <span className="text-blue-400">09-FEB-2026</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <h6 className="text-xs font-bold text-slate-500 uppercase mb-3">Enterprise Support</h6>
                <a href="mailto:clinical@posturehealth.com" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 transition-colors">
                  <i className="bi bi-envelope"></i>
                  Contact Support Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
