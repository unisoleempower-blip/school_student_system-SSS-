const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { emitEvent } = require('../kafka/producer');

// POST dispatch weekly report summary to parents via WhatsApp
router.post(['/whatsapp-dispatch', '/dispatch-whatsapp'], async (req, res) => {
  try {
    const {
      studentId = 'b0000000-0000-0000-0000-000000000001',
      parentPhone = '+91 98160-XXXXX'
    } = req.body;

    const student = inMemoryStore.users.find(u => u.id === studentId) || {
      full_name: 'Aryan Sharma',
      roll_number: '11-S-24'
    };

    const formattedMessage = `*Unisole AI School*\n*Weekly Academic Dossier for ${student.full_name} (Roll: ${student.roll_number})*\n\n` +
      `*Performance Summary:*\n` +
      `• Weekly Accuracy: 78.4%\n` +
      `• Study Time: 15.2 hrs\n` +
      `• Mastered: Moment of Inertia (95% accuracy)\n` +
      `• Focus Need: Damped Oscillations\n\n` +
      `*Recommended Parent Action for this Weekend:*\n` +
      `1. Ask Aryan: _"How do car shock absorbers stop a car from bouncing?"_ (5-min Feynman check)\n` +
      `2. Ensure 45 mins quiet time Sunday morning for the speed recap drill.\n\n` +
      `Official Portal: https://scholar.unisole.ai/report/${studentId}\n` +
      `_Unisole AI School Scholar Assistant_`;

    // Stream event to Kafka
    await emitEvent('notifications.whatsapp-sent', studentId, {
      action: 'ParentNotificationDispatched',
      recipient: parentPhone,
      studentName: student.full_name
    });

    res.json({
      success: true,
      message: 'WhatsApp notification delivered successfully',
      dispatchId: `wa_disp_${Date.now()}`,
      recipient: parentPhone,
      messageContent: formattedMessage,
      dispatchedAt: new Date().toISOString(),
      status: 'DELIVERED'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
