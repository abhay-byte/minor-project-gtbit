const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authenticateToken = require('../middleware/auth.middleware');

// Log reminder status (mark as Taken/Missed/Snoozed)
router.post('/:id/log', authenticateToken, reminderController.logReminderStatus);

// Get logs for a specific reminder
router.get('/:id/logs', authenticateToken, reminderController.getReminderLogs);

module.exports = router;