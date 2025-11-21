// src/api/controllers/vault.controller.js
const db = require('../../config/db');
const cloudinary = require('../../config/cloudinary');

/**
 * Upload a prescription to the patient's vault
 */
exports.uploadPrescriptionToVault = async (req, res) => {
    const { userId, userUUID, role } = req.user;
    const { vaultType } = req.params; // prescription, lab_report, radiology, discharge, vaccination, doctor_notes, other

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can upload to vault.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: `vault/${vaultType}/${patientId}`,
                    public_id: `${Date.now()}-${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const documentUrl = uploadResult.secure_url;
        
        // Insert into appropriate vault table based on vaultType
        let insertQuery, insertParams;
        switch(vaultType) {
            case 'prescription':
                insertQuery = `
                    INSERT INTO prescription_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_prescription_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'lab_report':
                insertQuery = `
                    INSERT INTO lab_report_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_lab_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'radiology':
                insertQuery = `
                    INSERT INTO radiology_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_radiology_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'discharge':
                insertQuery = `
                    INSERT INTO discharge_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_discharge_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'vaccination':
                insertQuery = `
                    INSERT INTO vaccination_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_vaccination_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'doctor_notes':
                insertQuery = `
                    INSERT INTO doctor_notes_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_notes_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            case 'other':
                insertQuery = `
                    INSERT INTO other_documents_vault (patient_id, document_url, metadata, file_count)
                    VALUES ($1, $2, $3, 1)
                    RETURNING vault_other_id;
                `;
                insertParams = [patientId, documentUrl, JSON.stringify(req.body.metadata || {})];
                break;
            default:
                return res.status(400).json({ message: 'Invalid vault type.' });
        }

        const result = await db.query(insertQuery, insertParams);

        res.status(201).json({
            message: 'Document uploaded to vault successfully.',
            documentUrl
        });

    } catch (error) {
        console.error('Error uploading document to vault:', error);
        res.status(500).json({ message: 'An error occurred while uploading the document.', error: error.message });
    }
};

/**
 * Get all documents from a specific vault for the patient
 */
exports.getVaultDocuments = async (req, res) => {
    const { userId, userUUID, role } = req.user;
    const { vaultType } = req.params;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can access vault.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        let query, queryParams;
        switch(vaultType) {
            case 'prescription':
                query = `
                    SELECT
                        vault_prescription_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM prescription_vault
                    WHERE patient_id = $1
                    ORDER BY vault_prescription_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'lab_report':
                query = `
                    SELECT
                        vault_lab_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM lab_report_vault
                    WHERE patient_id = $1
                    ORDER BY vault_lab_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'radiology':
                query = `
                    SELECT
                        vault_radiology_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM radiology_vault
                    WHERE patient_id = $1
                    ORDER BY vault_radiology_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'discharge':
                query = `
                    SELECT
                        vault_discharge_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM discharge_vault
                    WHERE patient_id = $1
                    ORDER BY vault_discharge_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'vaccination':
                query = `
                    SELECT
                        vault_vaccination_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM vaccination_vault
                    WHERE patient_id = $1
                    ORDER BY vault_vaccination_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'doctor_notes':
                query = `
                    SELECT
                        vault_notes_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM doctor_notes_vault
                    WHERE patient_id = $1
                    ORDER BY vault_notes_id DESC;
                `;
                queryParams = [patientId];
                break;
            case 'other':
                query = `
                    SELECT
                        vault_other_id as vault_id,
                        document_url,
                        metadata,
                        file_count
                    FROM other_documents_vault
                    WHERE patient_id = $1
                    ORDER BY vault_other_id DESC;
                `;
                queryParams = [patientId];
                break;
            default:
                return res.status(400).json({ message: 'Invalid vault type.' });
        }

        const result = await db.query(query, queryParams);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching vault documents:', error);
        res.status(500).json({ message: 'An error occurred while fetching documents.', error: error.message });
    }
};