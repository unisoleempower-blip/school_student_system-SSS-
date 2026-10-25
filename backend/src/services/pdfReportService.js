// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: PDF REPORT GENERATION SERVICE
// Compiles academic telemetry into an official printable document
// ============================================================================

/**
 * Generate a styled, printable HTML template for the Weekly Smart Report Card
 * @param {object} reportData
 */
function generatePrintableReportHtml(reportData) {
  const {
    studentName = 'Aryan Sharma',
    rollNumber = '11-S-24',
    grade = '11',
    section = 'Science-A',
    board = 'CBSE / JEE Main',
    overallScorePercentage = 78.4,
    totalStudyHours = 15.2,
    questionsAttempted = 68,
    averageVelocitySeconds = 112,
    schoolHostelActions = [],
    parentActions = []
  } = reportData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HAPS Academic Report - ${studentName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 30px; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 3px double #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title h1 { margin: 0; color: #0f172a; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .title p { margin: 2px 0 0; color: #0284c7; font-weight: bold; font-size: 12px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
    .meta-item { font-size: 11px; }
    .meta-item strong { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
    .stat-box { border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; text-align: center; }
    .stat-val { font-size: 18px; font-weight: bold; color: #0284c7; margin-top: 4px; }
    .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 20px 0 10px; color: #0f172a; }
    .directive-card { background: #f0fdf4; border-left: 4px solid #10b981; padding: 10px 14px; margin-bottom: 10px; border-radius: 0 4px 4px 0; }
    .directive-card.school { background: #eef2ff; border-left-color: #6366f1; }
    .signature-row { margin-top: 40px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 1px solid #e2e8f0; font-size: 11px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">
      <h1>Him Academy Public School, Hamirpur</h1>
      <p>HAPS-AI Scholar Assistant &bull; Weekly Academic Diagnostic Dossier</p>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}<br>
      Report ID: HAPS-REP-${Date.now().toString().slice(-6)}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><strong>Student Name</strong> ${studentName}</div>
    <div class="meta-item"><strong>Roll Number</strong> ${rollNumber}</div>
    <div class="meta-item"><strong>Class & Section</strong> Class ${grade} (${section})</div>
    <div class="meta-item"><strong>Target Track</strong> ${board}</div>
  </div>

  <div class="stats-row">
    <div class="stat-box">
      <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Weekly Accuracy</div>
      <div class="stat-val">${overallScorePercentage}%</div>
    </div>
    <div class="stat-box">
      <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Total Study Time</div>
      <div class="stat-val">${totalStudyHours} hrs</div>
    </div>
    <div class="stat-box">
      <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Problems Solved</div>
      <div class="stat-val">${questionsAttempted}</div>
    </div>
    <div class="stat-box">
      <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Average Velocity</div>
      <div class="stat-val">${averageVelocitySeconds}s / Q</div>
    </div>
  </div>

  <div class="section-title">🏫 Directives for School & Residential Hostel Faculty (Evening Prep)</div>
  ${schoolHostelActions.map(a => `
    <div class="directive-card school">
      <strong>${a.directive || a.action}</strong><br>
      <span style="font-size: 11px; color: #475569;">Responsible: ${a.faculty || a.responsible_faculty || 'Subject Faculty'}</span>
    </div>
  `).join('')}

  <div class="section-title">🏡 Directives for Parents at Home (Weekend Support)</div>
  ${parentActions.map(a => `
    <div class="directive-card">
      <strong>${a.directive || a.action}</strong><br>
      <span style="font-size: 11px; color: #475569;">Purpose: ${a.purpose || 'Solidifies intuitive clarity without exam stress.'}</span>
    </div>
  `).join('')}

  <div class="signature-row">
    <div><strong>Class Coordinator</strong><br>Him Academy Public School</div>
    <div><strong>Subject Faculty</strong><br>Dept. of Physics & Chemistry</div>
    <div><strong>Academic Director</strong><br>HAPS Vikas Nagar, Hamirpur</div>
  </div>
</body>
</html>
`;
}

module.exports = {
  generatePrintableReportHtml
};
