const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');
const cloudinary = require('../../config/cloudinary');
const path = require('path');

// 4. Request Lab Report Upload - POST /api/upload-report-requests
const requestLabReportUpload = async (req, res, next) => {
  try {
    const { patient_id, consultation_id, requested_tests, due_date, additional_notes } = req.body;

    // Validate required fields
    if (!patient_id || !consultation_id || !requested_tests || !due_date) {
      return res.status(400).json({
        error: 'Patient ID, consultation ID, requested tests, and due date are required'
      });
    }

    // Validate due date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      return res.status(400).json({
        error: 'Invalid due date format. Use YYYY-MM-DD'
      });
    }

    // Check if patient exists
    const patientQuery = 'SELECT patient_id FROM patients WHERE patient_id = $1';
    const patientResult = await db.query(patientQuery, [patient_id]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    // Check if consultation exists and belongs to the professional's patient
    const consultationQuery = `
      SELECT c.*, a.professional_id, p.user_id as professional_user_id
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.appointment_id
      JOIN professionals p ON a.professional_id = p.professional_id
      WHERE c.consultation_id = $1 AND p.user_id = $2
    `;
    const consultationResult = await db.query(consultationQuery, [consultation_id, req.user.userId]);

    if (consultationResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Consultation not found or not accessible'
      });
    }

    // Generate request code
    const requestCode = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the upload report request
    const requestQuery = `
      INSERT INTO upload_report_requests (
        request_id,
        patient_id,
        professional_id,
        request_code,
        requested_tests,
        due_date,
        additional_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const requestResult = await db.query(requestQuery, [
      uuidv4(),
      patient_id,
      req.user.userId, // professional_id
      requestCode,
      requested_tests,
      due_date,
      additional_notes || null
    ]);

    const request = requestResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Report request sent to patient',
      request: {
        request_id: request.request_id,
        request_code: request.request_code,
        patient_id: request.patient_id,
        professional_id: request.professional_id,
        requested_tests: request.requested_tests,
        due_date: request.due_date,
        status: request.status,
        additional_notes: request.additional_notes,
        created_at: request.created_at
      }
    });

  } catch (error) {
    console.error('Error requesting lab report upload:', error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Get Report Requests (Professional) - GET /api/upload-report-requests
const getReportRequestsProfessional = async (req, res, next) => {
  try {
    const { status, patient_id } = req.query;

    // Build query with filters
    let query = `
      SELECT
        urr.request_id,
        urr.request_code,
        urr.patient_id,
        u.full_name as patient_name,
        urr.requested_tests,
        urr.due_date,
        urr.status,
        urr.created_at
      FROM upload_report_requests urr
      JOIN patients p ON urr.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      WHERE urr.professional_id = $1
    `;
    
    const queryParams = [req.user.userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND urr.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (patient_id) {
      query += ` AND urr.patient_id = $${paramIndex}`;
      queryParams.push(patient_id);
      paramIndex++;
    }

    query += ' ORDER BY urr.created_at DESC';

    const result = await db.query(query, queryParams);

    res.status(200).json({
      success: true,
      total: result.rows.length,
      requests: result.rows
    });

  } catch (error) {
    console.error('Error getting report requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Get Report Request (Patient View) - GET /api/upload-report-requests/me
const getReportRequestsPatient = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Build query with filters
    let query = `
      SELECT 
        urr.request_id,
        urr.request_code,
        pr.full_name as professional_name,
        urr.requested_tests,
        urr.due_date,
        urr.status,
        urr.additional_notes,
        urr.created_at
      FROM upload_report_requests urr
      JOIN professionals p ON urr.professional_id = p.professional_id
      JOIN users pr ON p.user_id = pr.user_id
      WHERE urr.patient_id = $1
    `;
    
    const queryParams = [req.user.userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND urr.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    query += ' ORDER BY urr.created_at DESC';

    const result = await db.query(query, queryParams);

    res.status(200).json({
      success: true,
      total: result.rows.length,
      requests: result.rows
    });

  } catch (error) {
    console.error('Error getting report requests for patient:', error);
    res.status(500).json({ error: error.message });
  }
};

// 7. Upload Test Report (Patient) - POST /api/upload-report-requests/:requestId/upload
const uploadTestReport = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { test_type, upload_method } = req.body;
    const file = req.file;

    // Validate required fields
    if (!test_type || !upload_method) {
      return res.status(400).json({
        error: 'Test type and upload method are required'
      });
    }

    // Validate upload method
    if (!['File', 'Camera'].includes(upload_method)) {
      return res.status(400).json({
        error: 'Upload method must be either File or Camera'
      });
    }

    // Check if the request exists and belongs to the patient
    const requestQuery = `
      SELECT urr.*
      FROM upload_report_requests urr
      WHERE urr.request_id = $1 AND urr.patient_id = $2
    `;
    const requestResult = await db.query(requestQuery, [requestId, req.user.userId]);

    if (requestResult.rows.length === 0) {
      return res.status(403).json({
        error: 'This request is not for you'
      });
    }

    const request = requestResult.rows[0];

    // Upload file to Cloudinary if provided
    let documentUrl = null;
    if (file) {
      try {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "test_reports", // Optional: organize files in a folder
          use_filename: true,
          unique_filename: true
        });
        
        documentUrl = result.secure_url;
        
        // Clean up local file after upload
        const fs = require('fs');
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({
          error: 'Failed to upload document to storage'
        });
      }
    }

    // Create the upload record
    const uploadQuery = `
      INSERT INTO uploaded_test_reports (
        upload_id,
        request_id,
        test_type,
        document_url,
        upload_method
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const uploadResult = await db.query(uploadQuery, [
      uuidv4(),
      requestId,
      test_type,
      documentUrl,
      upload_method
    ]);

    const upload = uploadResult.rows[0];

    // Update the request status to 'Submitted'
    await db.query(
      'UPDATE upload_report_requests SET status = $1 WHERE request_id = $2',
      ['Submitted', requestId]
    );

    res.status(200).json({
      success: true,
      message: 'Test report uploaded successfully',
      upload: {
        upload_id: upload.upload_id,
        request_id: upload.request_id,
        test_type: upload.test_type,
        document_url: upload.document_url,
        uploaded_at: upload.uploaded_at,
        upload_method: upload.upload_method
      },
      request_status: 'Submitted'
    });

  } catch (error) {
    console.error('Error uploading test report:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
 requestLabReportUpload,
  getReportRequestsProfessional,
  getReportRequestsPatient,
  uploadTestReport
};