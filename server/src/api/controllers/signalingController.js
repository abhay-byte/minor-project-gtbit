const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db'); // Adjust path as needed

/**
 * Creates a video consultation room for an appointment
 * @route POST /api/signaling/room
 */
exports.createRoom = async (req, res, next) => {
  try {
    const { appointment_id } = req.body;

    // Validate input
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: 'appointment_id is required'
      });
    }

    // Check if appointment exists
    // First try with integer (original format)
    let result;
    let appointmentQuery;
    
    // Try to convert to integer first, if it fails, handle as UUID
    let appointmentIdForQuery;
    const isInteger = Number.isInteger(Number(appointment_id));
    
    if (isInteger) {
      appointmentIdForQuery = parseInt(appointment_id);
      appointmentQuery = 'SELECT appointment_id FROM appointments WHERE appointment_id = $1';
      result = await db.query(appointmentQuery, [appointmentIdForQuery]);
    } else {
      // If not an integer, assume it might be a UUID or another format
      // We'll need to determine the correct approach based on the actual data model
      // For now, let's try to find if there's an appointment_id_uuid column
      appointmentQuery = 'SELECT appointment_id FROM appointments WHERE appointment_id::text = $1';
      result = await db.query(appointmentQuery, [appointment_id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Generate room ID
    const room_id = uuidv4();
    
    // Construct consultation link based on domain
    const domain = process.env.APP_DOMAIN || 'https://clinico.com';
    const consultation_link = `${domain}/room/${room_id}`;

    // Update appointment with consultation link
    const updateQuery = 'UPDATE appointments SET consultation_link = $1 WHERE appointment_id = $2';
    await db.query(updateQuery, [consultation_link, appointment_id]);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        room_id,
        consultation_link
      }
    });

  } catch (error) {
    console.error('Error creating room:', error);
    next(error);
 }
};

/**
 * Validates if user can join a video room
 * @route GET /api/signaling/validate/:roomId
 */
exports.validateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // Extract user ID from token - check both id and userId fields to handle different token formats
    const userId = req.user.id || req.user.userId || req.user_id; // From auth middleware

    console.log('=== ROOM VALIDATION DEBUG ===');
    console.log('Room ID:', roomId);
    console.log('User ID from token:', userId);
    console.log('Full user object:', req.user);
    console.log('APP_DOMAIN environment variable:', process.env.APP_DOMAIN);

    // Validate input
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Construct consultation link to search
    const domain = process.env.APP_DOMAIN || 'https://clinico.com';
    const consultation_link = `${domain}/room/${roomId}`;
    
    console.log('Looking for consultation_link:', consultation_link);

    // Find appointment with this room
    const appointmentQuery = `
      SELECT
        a.appointment_id,
        a.patient_id,
        a.professional_id,
        p.user_id as patient_user_id,
        pr.user_id as professional_user_id,
        u_p.full_name as patient_name,
        u_pr.full_name as professional_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN professionals pr ON a.professional_id = pr.professional_id
      LEFT JOIN users u_p ON p.user_id = u_p.user_id
      LEFT JOIN users u_pr ON pr.user_id = u_pr.user_id
      WHERE a.consultation_link = $1
    `;
    
    const result = await db.query(appointmentQuery, [consultation_link]);
    
    console.log('Found appointments:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ No appointment found');
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        data: {
          is_valid: false
        }
      });
    }

    const appointment = result.rows[0];
    console.log('Appointment details:', {
      appointment_id: appointment.appointment_id,
      patient_user_id: appointment.patient_user_id,
      professional_user_id: appointment.professional_user_id,
      matches_patient: userId === appointment.patient_user_id,
      matches_professional: userId === appointment.professional_user_id
    });

    // Check if user is participant
    let role = null;
    let identity_name = null;

    if (userId === appointment.patient_user_id) {
      role = 'Patient';
      identity_name = appointment.patient_name;
      console.log('✅ User authorized as Patient');
    } else if (userId === appointment.professional_user_id) {
      role = 'Doctor';
      identity_name = appointment.professional_name;
      console.log('✅ User authorized as Doctor');
    }

    if (!role) {
      console.log('❌ User not authorized');
      console.log('Token user_id:', userId);
      console.log('Patient user_id:', appointment.patient_user_id);
      console.log('Doctor user_id:', appointment.professional_user_id);
      
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to join this room',
        debug: {
          token_user_id: userId,
          patient_user_id: appointment.patient_user_id,
          professional_user_id: appointment.professional_user_id
        },
        data: {
          is_valid: false
        }
      });
    }

    console.log('✅ Validation successful');
    console.log('============================');

    // Valid access
    res.status(200).json({
      success: true,
      data: {
        is_valid: true,
        role,
        identity_name
      }
    });

  } catch (error) {
    console.error('Error validating room:', error);
    next(error);
  }
};