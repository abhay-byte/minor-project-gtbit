// src/api/controllers/__tests__/vault.controller.test.js
const {
    uploadPrescriptionToVault,
    getVaultDocuments
} = require('../vault.controller');
const db = require('../../../config/db');
const cloudinary = require('../../../config/cloudinary');

// Mock the database module
jest.mock('../../../config/db', () => ({
    query: jest.fn(),
}));

// Mock the cloudinary module
jest.mock('../../../config/cloudinary', () => ({
    uploader: {
        upload_stream: jest.fn(),
    },
}));

describe('Vault Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            user: { userId: 1, userUUID: 'some-uuid', role: 'Patient' },
            params: { vaultType: 'prescription' },
            body: {},
            file: {
                originalname: 'test.pdf',
                buffer: Buffer.from('test file content'),
            },
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('uploadPrescriptionToVault', () => {
        it('should successfully upload a document to the vault', async () => {
            // Mock patient lookup
            db.query.mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] });
            
            // Mock vault insert
            db.query.mockResolvedValueOnce({ 
                rows: [{ 
                    vault_prescription_id: 1,
                    vault_prescription_id_uuid: 'vault-uuid',
                    document_url: 'https://example.com/test.pdf'
                }] 
            });
            
            // Mock the Cloudinary upload_stream to simulate successful upload
            const mockUploadStream = {
                end: jest.fn((buffer) => {
                    // Simulate async callback after upload
                    process.nextTick(() => {
                        const callback = cloudinary.uploader.upload_stream.mock.calls[0][1];
                        callback(null, { secure_url: 'https://example.com/test.pdf' });
                    });
                })
            };
            cloudinary.uploader.upload_stream.mockReturnValue(mockUploadStream);

            await uploadPrescriptionToVault(mockReq, mockRes);

            // Wait for async operations
            await new Promise(resolve => setImmediate(resolve));

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Document uploaded to vault successfully.',
                documentUrl: expect.any(String)
            }));
        });

        it('should return 403 if user is not a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Professional' };
            
            // Mock empty patient lookup
            db.query.mockResolvedValueOnce({ rows: [] });

            await uploadPrescriptionToVault(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can upload to vault.' });
        });

        it('should return 400 if no file is uploaded', async () => {
            mockReq.file = null;

            await uploadPrescriptionToVault(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'No file uploaded.' });
        });

        it('should handle different vault types', async () => {
            mockReq.params.vaultType = 'lab_report';
            
            // Mock patient lookup - make sure to use the same UUID as in the request
            db.query.mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] });
            
            // Mock vault insert - for lab_report type, it should return vault_lab_id
            db.query.mockResolvedValueOnce({
                rows: [{
                    vault_lab_id: 1
                }]
            });
            
            // Mock the Cloudinary upload_stream
            const mockUploadStream = {
                end: jest.fn((buffer) => {
                    process.nextTick(() => {
                        // Access the correct callback from the actual Cloudinary mock
                        if (cloudinary.uploader.upload_stream.mock.calls.length > 0) {
                            const callback = cloudinary.uploader.upload_stream.mock.calls[0][1];
                            if (callback) {
                                callback(null, { secure_url: 'https://example.com/test.pdf' });
                            }
                        }
                    });
                })
            };
            cloudinary.uploader.upload_stream.mockReturnValue(mockUploadStream);

            await uploadPrescriptionToVault(mockReq, mockRes);
            
            // Wait for async operations
            await new Promise(resolve => setImmediate(resolve));

            // The first call should be the patient lookup
            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Document uploaded to vault successfully.',
                documentUrl: 'https://example.com/test.pdf'
            }));
        });
    });

    describe('getVaultDocuments', () => {
        it('should fetch all documents from prescription vault for a patient', async () => {
            const mockDocuments = [
                {
                    vault_id: 1,
                    document_url: 'https://example.com/test.pdf',
                    metadata: '{}',
                    file_count: 1
                }
            ];
            db.query.mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] });
            db.query.mockResolvedValueOnce({ rows: mockDocuments });
    
            await getVaultDocuments(mockReq, mockRes);
    
            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM prescription_vault'), [101]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith([
                {
                    vault_lab_id: 1
                }
            ]);
        });

        it('should fetch documents from lab_report vault', async () => {
            mockReq.params.vaultType = 'lab_report';
            const mockDocuments = [
                {
                    vault_id: 1,
                    document_url: 'https://example.com/test.pdf',
                    metadata: '{}',
                    file_count: 1
                }
            ];
            db.query.mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] });
            db.query.mockResolvedValueOnce({ rows: mockDocuments });

            await getVaultDocuments(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM lab_report_vault'), [101]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith([
                {
                    vault_id: 1,
                    document_url: 'https://example.com/test.pdf',
                    metadata: '{}',
                    file_count: 1
                }
            ]);
        });

        it('should return 404 if user is not a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Professional' };
            
            // Mock empty patient lookup
            db.query.mockResolvedValueOnce({ rows: [] });

            await getVaultDocuments(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can access vault.' });
        });

        it('should return 400 for invalid vault type', async () => {
            mockReq.params.vaultType = 'invalid_type';

            await getVaultDocuments(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid vault type.' });
        });
    });
});