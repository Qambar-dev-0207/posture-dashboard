import React, { useState, useEffect } from 'react'
import { getReport } from '../utils/api'
import { jsPDF } from 'jspdf'

export default function Reports({ patientId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true)
      try {
        const response = await getReport(patientId, selectedDate)
        setReportData(response.data)
      } catch (err) {
        setError(err.message || 'Failed to load report')
        setReportData(null)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [selectedDate, patientId])

  const generatePDF = async () => {
    if (!reportData) return

    setGenerating(true)
    try {
      const doc = new jsPDF()
      const yPosition = 15

      // Header
      doc.setTextColor(59, 130, 246)
      doc.setFontSize(22)
      doc.text('POSTURE ANALYTICS REPORT', 15, yPosition)
      
      doc.setTextColor(100)
      doc.setFontSize(10)
      doc.text('Clinical Grade Monitoring System', 15, yPosition + 7)

      // Patient Info
      doc.setTextColor(0)
      doc.setFontSize(11)
      doc.text(`Patient ID: ${patientId}`, 15, yPosition + 20)
      doc.text(`Report Date: ${selectedDate}`, 15, yPosition + 25)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPosition + 30)

      // Summary
      doc.setFontSize(14)
      doc.setTextColor(59, 130, 246)
      doc.text('Daily Summary Metrics', 15, yPosition + 45)

      if (reportData.report) {
        doc.setTextColor(0)
        doc.setFontSize(10)
        doc.text(`Good Posture: ${reportData.report.good_posture_percentage}%`, 20, yPosition + 55)
        doc.text(`Bad Posture: ${reportData.report.bad_posture_percentage}%`, 20, yPosition + 60)
        doc.text(`Monitored Hours: ${reportData.report.total_monitored_hours}`, 20, yPosition + 65)
        doc.text(`Improvement vs Yesterday: ${reportData.report.improvement_vs_yesterday}%`, 20, yPosition + 70)
        
        doc.setFontSize(12)
        doc.text('Clinical Recommendations:', 15, yPosition + 85)
        doc.setFontSize(10)
        const splitText = doc.splitTextToSize(reportData.report.recommendation || 'Continue monitoring posture.', 170)
        doc.text(splitText, 15, yPosition + 95)
      }

      doc.save(`posture-report-${patientId}-${selectedDate}.pdf`)
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <i className="bi bi-file-earmark-pdf text-red-500"></i>
            Clinical Reports
          </h1>
          <p className="text-slate-400">Export comprehensive posture analysis for clinical review</p>
        </div>

        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <span className="text-slate-400 text-sm font-medium px-2">Report Date:</span>
          <input
            type="date"
            className="bg-slate-900 border-none text-white rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/50"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
          <i className="bi bi-exclamation-circle text-xl"></i>
          <div>
            <strong className="block font-semibold">Data Unavailable</strong>
            <span className="text-sm opacity-90">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Compiling report data...</p>
        </div>
      ) : reportData ? (
        <div className="grid grid-cols-1 gap-8 animate-fade-in">
          {/* Metrics Overview */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h5 className="font-bold text-white flex items-center gap-2">
                <i className="bi bi-collection text-primary-400"></i>
                Performance Summary
              </h5>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <h6 className="text-slate-500 text-xs mb-2 uppercase tracking-widest group-hover:text-success transition-colors">Good Posture</h6>
                  <h3 className="text-3xl font-mono font-bold text-success">{reportData.report?.good_posture_percentage}%</h3>
                </div>
                <div className="text-center group">
                  <h6 className="text-slate-500 text-xs mb-2 uppercase tracking-widest group-hover:text-danger transition-colors">Bad Posture</h6>
                  <h3 className="text-3xl font-mono font-bold text-danger">{reportData.report?.bad_posture_percentage}%</h3>
                </div>
                <div className="text-center group">
                  <h6 className="text-slate-500 text-xs mb-2 uppercase tracking-widest group-hover:text-primary-400 transition-colors">Monitoring</h6>
                  <h3 className="text-3xl font-mono font-bold text-primary-400">{reportData.report?.total_monitored_hours}h</h3>
                </div>
                <div className="text-center group">
                  <h6 className="text-slate-500 text-xs mb-2 uppercase tracking-widest group-hover:text-secondary-400 transition-colors">Improvement</h6>
                  <h3 className="text-3xl font-mono font-bold text-secondary-400">{reportData.report?.improvement_vs_yesterday}%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="glass-card bg-gradient-to-br from-warning/10 to-transparent border-warning/20 p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0 border border-warning/20">
                <i className="bi bi-heart-pulse text-3xl text-warning"></i>
              </div>
              <div className="space-y-2">
                <h5 className="text-xl font-bold text-white flex items-center gap-2">
                  Clinical Insights & Recommendations
                </h5>
                <p className="text-slate-300 leading-relaxed text-lg font-light">
                  {reportData.report?.recommendation || 'Continue established monitoring protocols. Patient alignment remains within stable parameters.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center pt-4">
            <button
              className="btn-cyber bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 px-8 py-4 rounded-xl text-lg group flex items-center gap-3"
              onClick={generatePDF}
              disabled={generating}
            >
              <i className={`bi ${generating ? 'bi-hourglass-split animate-spin' : 'bi-file-earmark-arrow-down'} group-hover:scale-110 transition-transform`}></i>
              {generating ? 'Finalizing PDF Document...' : 'Download Clinical PDF Report'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-6 py-8 rounded-2xl text-center space-y-2">
          <i className="bi bi-info-circle text-3xl opacity-50 block mb-2"></i>
          <h3 className="text-xl font-bold">No Records Found</h3>
          <p className="text-sm opacity-80">There are no monitoring logs available for {selectedDate}.</p>
        </div>
      )}
    </div>
  )
}
