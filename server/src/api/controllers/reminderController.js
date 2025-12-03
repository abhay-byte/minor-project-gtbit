const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

/**
 * Log medicine reminder status (Taken/Missed/Snoozed)
 * @route POST /api/reminders/:id/log
 */
exports.logReminderStatus = async (req, res, next) => {
  try {
    const { id: reminderId } = req.params;
    const { status, taken_time, notes } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Validate status enum
    const validStatuses = ['Taken', 'Missed', 'Snoozed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: Taken, Missed, Snoozed'
      });
    }

    // Verify reminder exists and belongs to user
    const reminderQuery = `
      SELECT mr.reminder_id, mr.prescription_id, p.patient_id
      FROM medicine_reminders mr
      JOIN prescriptions pr ON mr.prescription_id = pr.prescription_id
      JOIN patients p ON pr.patient_id = p.patient_id
      WHERE mr.reminder_id = $1 AND p.user_id = $2
    `;
    
    const reminderResult = await db.query(reminderQuery, [reminderId, userId]);

    if (reminderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found or does not belong to you'
      });
    }

    // Generate UUID for log
    const logId = uuidv4();

    // Insert reminder log
    const insertQuery = `
      INSERT INTO reminder_logs (
        log_id,
        reminder_id,
        scheduled_time,
        taken_time,
        status,
        notes
      ) VALUES ($1, $2, NOW(), $3, $4, $5)
    `;

    await db.query(insertQuery, [
      logId,
      reminderId,
      taken_time || null,
      status,
      notes || null
    ]);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Reminder status logged successfully',
      data: {
        log_id: logId,
        status: status,
        taken_time: taken_time || null,
        notes: notes || null
      }
    });

  } catch (error) {
    console.error('Error logging reminder status:', error);
    next(error);
 }
};

/**
 * Get reminder logs for a specific reminder
 * @route GET /api/reminders/:id/logs
 */
exports.getReminderLogs = async (req, res, next) => {
 try {
    const { id: reminderId } = req.params;
    const userId = req.user.userId;

    // Verify reminder belongs to user
    const reminderQuery = `
      SELECT mr.reminder_id
      FROM medicine_reminders mr
      JOIN prescriptions pr ON mr.prescription_id = pr.prescription_id
      JOIN patients p ON pr.patient_id = p.patient_id
      WHERE mr.reminder_id = $1 AND p.user_id = $2
    `;
    
    const reminderResult = await db.query(reminderQuery, [reminderId, userId]);

    if (reminderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }

    // Get logs
    const logsQuery = `
      SELECT 
        log_id,
        scheduled_time,
        taken_time,
        status,
        notes,
        created_at
      FROM reminder_logs
      WHERE reminder_id = $1
      ORDER BY scheduled_time DESC
      LIMIT 30
    `;

    const logsResult = await db.query(logsQuery, [reminderId]);

    res.status(200).json({
      success: true,
      data: logsResult.rows
    });

  } catch (error) {
    console.error('Error fetching reminder logs:', error);
    next(error);
  }
};

module.exports = {
  logReminderStatus: exports.logReminderStatus,
  getReminderLogs: exports.getReminderLogs
};
