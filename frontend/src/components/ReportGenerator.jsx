import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportGenerator({ report, patientId, date }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!report) return;

    setIsGenerating(true);
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-10000px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '30px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.fontFamily = 'Inter, Arial, sans-serif';
      tempDiv.innerHTML = `
        <div style="color: #1f2937;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
            <h1 style="color: #1e40af; margin: 0 0 10px 0; font-size: 28px;">🧍 POSTURE ANALYTICS REPORT</h1>
            <p style="color: #6b7280; margin: 0;">Clinical Grade Monitoring System</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Patient ID</p>
              <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 600;">${patientId}</p>
            </div>
            <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Report Date</p>
              <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 600;">${date}</p>
            </div>
            <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Generated</p>
              <p style="color: #1f2937; margin: 0; font-size: 14px;">${new Date().toLocaleString()}</p>
            </div>
            <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Status</p>
              <p style="color: #10b981; margin: 0; font-size: 14px; font-weight: 600;">✓ Healthy</p>
            </div>
          </div>

          <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Daily Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #d1d5db; font-weight: 600; color: #1f2937;">Metric</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600; color: #1f2937;">Value</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Total Monitored Hours</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.total_monitored_hours || 0}h</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Good Posture %</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600; color: #10b981;">${report.report?.good_posture_percentage || 0}%</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Bad Posture %</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600; color: #ef4444;">${report.report?.bad_posture_percentage || 0}%</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Improvement vs Yesterday</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.improvement_vs_yesterday || 0}%</td>
            </tr>
          </table>

          <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Average Deviations by Body Area</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #d1d5db; font-weight: 600; color: #1f2937;">Body Area</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600; color: #1f2937;">Deviation (degrees)</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600; color: #1f2937;">Status</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Neck</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.average_deviations?.neck || 0}°</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${report.report?.average_deviations?.neck || 0 > 10 ? '⚠️' : '✓'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Back</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.average_deviations?.back || 0}°</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${report.report?.average_deviations?.back || 0 > 10 ? '⚠️' : '✓'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Waist</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.average_deviations?.waist || 0}°</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${report.report?.average_deviations?.waist || 0 > 10 ? '⚠️' : '✓'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #d1d5db;">Left Shoulder</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.average_deviations?.left_shoulder || 0}°</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${report.report?.average_deviations?.left_shoulder || 0 > 10 ? '⚠️' : '✓'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Right Shoulder</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db; font-weight: 600;">${report.report?.average_deviations?.right_shoulder || 0}°</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${report.report?.average_deviations?.right_shoulder || 0 > 10 ? '⚠️' : '✓'}</td>
            </tr>
          </table>

          <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Clinical Recommendations</h2>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
            <p style="color: #92400e; margin: 0; line-height: 1.5;">
              ${report.report?.recommendations || 'Continue monitoring your posture regularly. Maintain good ergonomic practices throughout the day and take frequent breaks to adjust your posture.'}
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 12px;">
            <p>This report is generated automatically by the Posture Analytics System.</p>
            <p>Consult with a healthcare professional for personalized medical advice.</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`posture-report-${patientId}-${date}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Clinical Report</h3>
        <span className="text-2xl">📋</span>
      </div>

      {!report ? (
        <div className="py-12 text-center animate-pulse">
          <div className="h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded w-2/3 mx-auto mb-3" />
          <div className="h-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded w-1/2 mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-xs font-medium mb-2">Good Posture</p>
              <p className="text-2xl font-bold text-green-400">
                {report.report?.good_posture_percentage || 0}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-xs font-medium mb-2">Bad Posture</p>
              <p className="text-2xl font-bold text-red-400">
                {report.report?.bad_posture_percentage || 0}%
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {report.report?.recommendations && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <p className="text-sm text-blue-300 leading-relaxed">
                <strong>💡 Recommendations:</strong> {report.report.recommendations}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className={`w-full btn-primary py-3 font-semibold rounded-xl transition-all duration-300 ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Generating PDF...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>📥</span> Download Report PDF
              </span>
            )}
          </button>

          {/* Report Info */}
          <div className="text-xs text-white/50 text-center space-y-1 pt-4 border-t border-white/10">
            <p>Patient: <span className="text-white/70 font-mono">{patientId}</span></p>
            <p>Date: <span className="text-white/70 font-mono">{date}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
