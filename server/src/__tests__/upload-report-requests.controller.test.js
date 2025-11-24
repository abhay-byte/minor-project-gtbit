const { 
  requestLabReportUpload,
  getReportRequestsProfessional,
  getReportRequestsPatient,
  uploadTestReport
} = require('../api/controllers/upload-report-requests.controller');
const db = require('../config/db');

// Mock the database module
jest.mock('../config/db');

describe('Upload Report Requests Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 describe('requestLabReportUpload', () => {
    const mockReq = {
      body: {
        patient_id: 55,
        consultation_id: 205,
        requested_tests: 'CBC, Lipid Profile, HbA1c',
        due_date: '2025-11-25',
        additional_notes: 'Fasting required for 12 hours before test'
      },
      user: {
        userId: 10,
        role: 'Professional'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should return 400 when required fields are missing', async () => {
      const mockReqMissingFields = {
        body: {
          patient_id: 55
          // Missing other required fields
        },
        user: {
          userId: 10,
          role: 'Professional'
        }
      };

      await requestLabReportUpload(mockReqMissingFields, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Patient ID, consultation ID, requested tests, and due date are required'
      });
    });

    it('should return 400 when due date format is invalid', async () => {
      const mockReqInvalidDate = {
        body: {
          patient_id: 55,
          consultation_id: 205,
          requested_tests: 'CBC, Lipid Profile, HbA1c',
          due_date: 'invalid-date-format',
          additional_notes: 'Fasting required for 12 hours before test'
        },
        user: {
          userId: 10,
          role: 'Professional'
        }
      };

      await requestLabReportUpload(mockReqInvalidDate, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid due date format. Use YYYY-MM-DD'
      });
    });

    it('should return 404 when patient is not found', async () => {
      const mockEmptyPatientResult = {
        rows: []
      };

      db.query.mockResolvedValueOnce(mockEmptyPatientResult);

      await requestLabReportUpload(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith('SELECT patient_id FROM patients WHERE patient_id = $1', [55]);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Patient not found'
      });
    });

    it('should return 400 when consultation is not found or not accessible', async () => {
      const mockPatientResult = {
        rows: [{ patient_id: 55 }]
      };
      const mockEmptyConsultationResult = {
        rows: []
      };

      db.query
        .mockResolvedValueOnce(mockPatientResult)  // For patient check
        .mockResolvedValueOnce(mockEmptyConsultationResult);  // For consultation check

      await requestLabReportUpload(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Consultation not found or not accessible'
      });
    });

    it('should create a report request successfully', async () => {
      const mockPatientResult = {
        rows: [{ patient_id: 55 }]
      };
      const mockConsultationResult = {
        rows: [{
          consultation_id: 205,
          professional_id: 10,
          professional_user_id: 10
        }]
      };
      const mockRequestResult = {
        rows: [{
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          patient_id: 55,
          professional_id: 10,
          requested_tests: 'CBC, Lipid Profile, HbA1c',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required for 12 hours before test',
          created_at: '2025-11-19T10:30:00Z'
        }]
      };

      db.query
        .mockResolvedValueOnce(mockPatientResult)  // For patient check
        .mockResolvedValueOnce(mockConsultationResult)  // For consultation check
        .mockResolvedValueOnce(mockRequestResult);  // For insert query

      await requestLabReportUpload(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Report request sent to patient',
        request: {
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          patient_id: 55,
          professional_id: 10,
          requested_tests: 'CBC, Lipid Profile, HbA1c',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required for 12 hours before test',
          created_at: '2025-11-19T10:30:00Z'
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValueOnce(error);

      await requestLabReportUpload(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('getReportRequestsProfessional', () => {
    const mockReq = {
      query: {
        status: 'Pending',
        patient_id: '55'
      },
      user: {
        userId: 10,
        role: 'Professional'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should return report requests with filters for professional', async () => {
      const mockRequestsResult = {
        rows: [{
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          patient_id: 55,
          patient_name: 'Abhay Raj',
          requested_tests: 'CBC, Lipid Profile',
          due_date: '2025-11-25',
          status: 'Pending',
          created_at: '2025-11-19T10:30:00Z'
        }]
      };

      db.query.mockResolvedValueOnce(mockRequestsResult);

      await getReportRequestsProfessional(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE urr.professional_id = $1'), [10, 'Pending', '55']);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        total: 1,
        requests: [{
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          patient_id: 55,
          patient_name: 'Abhay Raj',
          requested_tests: 'CBC, Lipid Profile',
          due_date: '2025-11-25',
          status: 'Pending',
          created_at: '2025-11-19T10:30:00Z'
        }]
      });
    });

    it('should return all report requests without filters for professional', async () => {
      const mockReqNoFilters = {
        query: {},
        user: {
          userId: 10,
          role: 'Professional'
        }
      };

      const mockRequestsResult = {
        rows: []
      };

      db.query.mockResolvedValueOnce(mockRequestsResult);

      await getReportRequestsProfessional(mockReqNoFilters, mockRes);

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE urr.professional_id = $1'), [10]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        total: 0,
        requests: []
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValueOnce(error);

      await getReportRequestsProfessional(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('getReportRequestsPatient', () => {
    const mockReq = {
      query: {
        status: 'Pending'
      },
      user: {
        userId: 55,
        role: 'Patient'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should return report requests for patient', async () => {
      const mockRequestsResult = {
        rows: [{
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          professional_name: 'Dr. Smith',
          requested_tests: 'CBC, Lipid Profile',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required',
          created_at: '2025-11-19T10:30:00Z'
        }]
      };

      db.query.mockResolvedValueOnce(mockRequestsResult);

      await getReportRequestsPatient(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE urr.patient_id = $1'), [55, 'Pending']);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        total: 1,
        requests: [{
          request_id: 'uuid-string',
          request_code: 'REQ-2025-889',
          professional_name: 'Dr. Smith',
          requested_tests: 'CBC, Lipid Profile',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required',
          created_at: '2025-11-19T10:30:00Z'
        }]
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValueOnce(error);

      await getReportRequestsPatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('uploadTestReport', () => {
    const mockReq = {
      params: {
        requestId: 'some-uuid'
      },
      body: {
        test_type: 'CBC',
        upload_method: 'File'
      },
      file: {
        path: 'https://storage.example.com/test-report.pdf'
      },
      user: {
        userId: 55,
        role: 'Patient'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should return 400 when required fields are missing', async () => {
      const mockReqMissingFields = {
        params: {
          requestId: 'some-uuid'
        },
        body: {
          // Missing test_type and upload_method
        },
        user: {
          userId: 55,
          role: 'Patient'
        }
      };

      await uploadTestReport(mockReqMissingFields, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test type and upload method are required'
      });
    });

    it('should return 400 when upload method is invalid', async () => {
      const mockReqInvalidMethod = {
        params: {
          requestId: 'some-uuid'
        },
        body: {
          test_type: 'CBC',
          upload_method: 'InvalidMethod'
        },
        user: {
          userId: 55,
          role: 'Patient'
        }
      };

      await uploadTestReport(mockReqInvalidMethod, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Upload method must be either File or Camera'
      });
    });

    it('should return 403 when request does not belong to patient', async () => {
      const mockEmptyRequestResult = {
        rows: []
      };

      db.query.mockResolvedValueOnce(mockEmptyRequestResult);

      await uploadTestReport(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE urr.request_id = $1 AND urr.patient_id = $2'), ['some-uuid', 55]);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'This request is not for you'
      });
    });

    it('should upload test report successfully', async () => {
      const mockRequestResult = {
        rows: [{
          request_id: 'some-uuid',
          patient_id: 55
        }]
      };
      const mockUploadResult = {
        rows: [{
          upload_id: 'upload-uuid',
          request_id: 'some-uuid',
          test_type: 'CBC',
          document_url: 'https://storage.example.com/test-report.pdf',
          uploaded_at: '2025-11-20T14:30:00Z',
          upload_method: 'File'
        }]
      };

      db.query
        .mockResolvedValueOnce(mockRequestResult)  // For request validation
        .mockResolvedValueOnce(mockUploadResult)   // For insert upload
        .mockResolvedValueOnce();                 // For update status

      await uploadTestReport(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Test report uploaded successfully',
        upload: {
          upload_id: 'upload-uuid',
          request_id: 'some-uuid',
          test_type: 'CBC',
          document_url: 'https://storage.example.com/test-report.pdf',
          uploaded_at: '2025-11-20T14:30:00Z',
          upload_method: 'File'
        },
        request_status: 'Submitted'
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValueOnce(error);

      await uploadTestReport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
 });
});