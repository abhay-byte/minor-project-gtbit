const { query } = require('../../config/db');
const os = require('os');

/**
 * Health Check Endpoint
 * GET /api/health
 * Check if the API server is running and healthy.
 */
const healthCheck = async (req, res) => {
 try {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Check database connection by running a simple query
    let dbHealthy = false;
    let dbError = null;
    
    try {
      await query('SELECT 1');
      dbHealthy = true;
    } catch (error) {
      dbError = error.message;
      dbHealthy = false;
    }
    
    // Calculate uptime in seconds
    const uptime = Math.floor(process.uptime());
    
    // Prepare response based on health status
    if (dbHealthy) {
      return res.status(200).json({
        status: 'healthy',
        timestamp,
        uptime,
        service: 'Clinico API',
        version: '1.0.0'
      });
    } else {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp,
        error: `Database connection failed: ${dbError}`
      });
    }
  } catch (error) {
    // If there's an error in the health check itself
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
 }
};

/**
 * Root Endpoint
 * GET /api
 * Get API information and available routes.
 */
const getApiInfo = (req, res) => {
  const timestamp = new Date().toISOString();
  
  return res.status(200).json({
    message: 'Welcome to Clinico API',
    version: '1.0.0',
    status: 'running',
    timestamp,
    endpoints: {
      health: {
        path: '/api/health',
        method: 'GET',
        description: 'Health check endpoint',
        example_request: {},
        example_response: {
          status: 'healthy',
          timestamp: '2025-01-23T10:30:00.000Z',
          uptime: 3600,
          service: 'Clinico API',
          version: '1.0.0'
        }
      },
      auth: {
        path: '/api/auth',
        methods: ['POST /register', 'POST /login'],
        description: 'Authentication endpoints',
        example_request: {
          register: {
            email: 'user@example.com',
            password: 'securepassword',
            full_name: 'John Doe',
            phone_number: '1234567890',
            role: 'Patient'
          },
          login: {
            email: 'user@example.com',
            password: 'securepassword'
          }
        },
        example_response: {
          success: true,
          message: 'Login successful',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            user_id: 1,
            email: 'user@example.com',
            full_name: 'John Doe',
            role: 'Patient'
          }
        }
      },
      users: {
        path: '/api/users',
        methods: ['GET /me', 'PUT /me', 'POST /me/records', 'GET /me/records', 'DELETE /me/records/:recordId'],
        description: 'User management endpoints',
        example_request: {
          update_profile: {
            fullName: 'John Smith',
            phoneNumber: '0987654321'
          }
        },
        example_response: {
          message: 'Profile updated successfully.'
        }
      },
      professionals: {
        path: '/api/professionals',
        methods: ['GET /', 'GET /me/dashboard', 'GET /:id/availability', 'PUT /me/profile', 'POST /availability/batch', 'GET /:id/profile'],
        description: 'Professional management endpoints',
        example_request: {
          create_profile: {
            specialty: 'Cardiology',
            credentials: 'MD, PhD',
            years_of_experience: 10,
            languages_spoken: 'English, Spanish'
          }
        },
        example_response: {
          message: 'Professional profile created successfully.',
          professional_id: 1
        }
      },
      appointments: {
        path: '/api/appointments',
        methods: ['POST /', 'GET /me'],
        description: 'Appointment booking and management endpoints',
        example_request: {
          book_appointment: {
            slotId: 1,
            patientNotes: 'Patient has high blood pressure'
          }
        },
        example_response: {
          message: 'Appointment booked successfully!',
          appointmentId: 1
        }
      },
      clinics: {
        path: '/api/clinics',
        methods: ['GET /search', 'GET /:id', 'GET /:id/doctors', 'POST /doctors/:doctorId/reviews', 'GET /doctors/:doctorId/reviews', 'GET /doctors/:doctorId/reviews/stats', 'POST /search-history', 'GET /search-history'],
        description: 'Clinic discovery and management endpoints',
        example_request: {
          search_clinics: {
            lat: 28.6139,
            lon: 77.2090,
            radius: 5,
            specialty: 'Cardiology'
          }
        },
        example_response: {
          count: 5,
          radius_km: 5,
          location: {
            lat: 28.6139,
            lon: 77.2090
          },
          clinics: [
            {
              clinic_id: 1,
              name: 'ABC Clinic',
              address: '123 Main St, New Delhi',
              distance: 1.2
            }
          ]
        }
      },
      prescriptions: {
        path: '/api/prescriptions',
        methods: ['GET /me', 'GET /me/:prescriptionId', 'GET /lists', 'GET /reminders', 'GET /reminders/:reminderId/logs'],
        description: 'Prescription management endpoints',
        example_request: {},
        example_response: [
          {
            prescription_id: 1,
            medication_name: 'Aspirin',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '7 days',
            prescribed_date: '2025-01-20'
          }
        ]
      },
      reviews: {
        path: '/api/reviews',
        methods: ['POST /', 'PUT /:reviewId', 'DELETE /:reviewId', 'GET /me', 'GET /:reviewId'],
        description: 'Review management endpoints',
        example_request: {
          create_review: {
            target_type: 'Professional',
            target_id: 1,
            rating: 5,
            comment: 'Excellent doctor, very helpful',
            appreciated_aspects: 'Professionalism and care'
          }
        },
        example_response: {
          success: true,
          message: 'Review submitted successfully',
          review: {
            review_id: 1,
            patient_id: 1,
            target_type: 'Professional',
            target_id: 1,
            rating: 5,
            comment: 'Excellent doctor, very helpful',
            created_at: '2025-01-23T10:30:00.000Z'
          }
        }
      },
      vault: {
        path: '/api/vault',
        methods: ['POST /:vaultType/upload', 'GET /:vaultType'],
        description: 'Medical document vault endpoints',
        example_request: {
          upload_document: {
            documentFile: 'file',
            documentName: 'Lab Report',
            documentType: 'Lab Report'
          }
        },
        example_response: {
          message: 'Document uploaded to vault successfully.',
          vaultId: 1,
          documentUrl: 'https://example.com/document/1'
        }
      },
      chat: {
        path: '/api/chat',
        methods: ['GET /history', 'DELETE /history', 'GET /stats'],
        description: 'AI chat endpoints',
        example_request: {},
        example_response: {
          messages: [
            {
              log_id: 1,
              message_content: 'Hello, how can I help you?',
              sender: 'AI',
              timestamp: '2025-01-23T10:30:00.000Z'
            }
          ],
          total: 1,
          limit: 50,
          offset: 0
        }
      }
    },
    documentation: 'https://docs.clinico.com/api'
  });
};

module.exports = {
  healthCheck,
  getApiInfo
};