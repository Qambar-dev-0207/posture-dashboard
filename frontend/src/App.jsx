import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { healthCheck } from './utils/api'

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [patientId, setPatientId] = useState(
    localStorage.getItem('patientId') || 'patient_001'
  )

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthCheck()
        setApiStatus(response.data?.status === 'healthy' ? 'healthy' : 'warning')
      } catch (error) {
        setApiStatus('error')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const handlePatientIdChange = (newId) => {
    setPatientId(newId)
    localStorage.setItem('patientId', newId)
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <Navbar 
          apiStatus={apiStatus} 
          patientId={patientId}
          onPatientIdChange={handlePatientIdChange}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard patientId={patientId} />} />
            <Route path="/analytics" element={<Analytics patientId={patientId} />} />
            <Route path="/reports" element={<Reports patientId={patientId} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
