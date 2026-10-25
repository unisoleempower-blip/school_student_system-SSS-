const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { generateWeeklyReport } = require('../services/smartReportService');
const { emitEvent } = require('../kafka/producer');

// GET latest weekly report for student
router.get('/weekly/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const existingReport = inMemoryStore.weeklyReports.find(r => r.student_id === studentId || r.studentId === studentId);

  if (existingReport) {
    return res.json({ success: true, report: existingReport });
  }

  // Generate on-the-fly if not already stored
  const newReport = await generateWeeklyReport(studentId);
  inMemoryStore.weeklyReports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

// POST generate new weekly report
router.post('/generate-weekly', async (req, res) => {
  try {
    const { studentId = 'b0000000-0000-0000-0000-000000000001' } = req.body;
    const report = await generateWeeklyReport(studentId);
    
    inMemoryStore.weeklyReports.unshift(report);

    // Emit event to Kafka
    await emitEvent('reports.weekly-trigger', studentId, {
      action: 'WeeklyReportGenerated',
      reportId: report.id,
      overallScore: report.overallScorePercentage
    });

    res.status(201).json({
      success: true,
      message: 'Weekly Smart Report Card generated with dual School & Parent directives.',
      report
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
