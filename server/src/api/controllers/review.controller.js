// Using the built-in crypto module instead of uuid for Jest compatibility
const crypto = require('crypto');

// Helper function to generate UUID v4
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = crypto.randomFillSync(new Uint8Array(1))[0] % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
const db = require('../../config/db');

// Helper function to validate rating
const isValidRating = (rating) => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// Helper function to get target entity name for response
const getTargetName = async (target_type, target_id) => {
  try {
    let query = '';
    let params = [target_id];

    switch(target_type) {
      case 'Professional':
        query = 'SELECT full_name as name FROM users WHERE user_id = (SELECT user_id FROM professionals WHERE professional_id = $1)';
        break;
      case 'ClinicDoctor':
        query = 'SELECT full_name as name FROM clinic_doctors WHERE clinic_doctor_id = $1';
        break;
      case 'Clinic':
        query = 'SELECT name FROM clinics WHERE clinic_id = $1';
        break;
      case 'Appointment':
        query = `
          SELECT 
            CASE 
              WHEN a.professional_id IS NOT NULL THEN u.full_name
              WHEN a.clinic_doctor_id IS NOT NULL THEN cd.full_name
              ELSE 'Unknown'
            END as name
          FROM appointments a
          LEFT JOIN professionals p ON a.professional_id = p.professional_id
          LEFT JOIN users u ON p.user_id = u.user_id
          LEFT JOIN clinic_doctors cd ON a.clinic_doctor_id = cd.clinic_doctor_id
          WHERE a.appointment_id = $1
        `;
        break;
      default:
        return null;
    }

    const result = await db.query(query, params);
    return result.rows.length > 0 ? result.rows[0].name : 'Unknown';
  } catch (error) {
    console.error('Error getting target name:', error);
    return 'Unknown';
  }
};

// Helper function to get patient name
const getPatientName = async (patient_id) => {
  try {
    const result = await db.query('SELECT full_name FROM users WHERE user_id = (SELECT user_id FROM patients WHERE patient_id = $1)', [patient_id]);
    return result.rows.length > 0 ? result.rows[0].full_name : 'Unknown';
  } catch (error) {
    console.error('Error getting patient name:', error);
    return 'Unknown';
  }
};

// Helper function to update target entity ratings
const updateTargetRatings = async (target_type, target_id) => {
  try {
    let query = '';
    let params = [target_id];

    switch(target_type) {
      case 'Professional':
        query = `
          UPDATE professionals 
          SET 
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE target_type = 'Professional' AND target_id = $1),
            total_reviews = (SELECT COUNT(*) FROM reviews WHERE target_type = 'Professional' AND target_id = $1)
          WHERE professional_id = $1
        `;
        break;
      case 'ClinicDoctor':
        query = `
          UPDATE clinic_doctors 
          SET 
            rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE target_type = 'ClinicDoctor' AND target_id = $1),
            review_count = (SELECT COUNT(*) FROM reviews WHERE target_type = 'ClinicDoctor' AND target_id = $1)
          WHERE clinic_doctor_id = $1
        `;
        break;
      case 'Clinic':
        query = `
          UPDATE clinics 
          SET 
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE target_type = 'Clinic' AND target_id = $1),
            total_reviews = (SELECT COUNT(*) FROM reviews WHERE target_type = 'Clinic' AND target_id = $1)
          WHERE clinic_id = $1
        `;
        break;
      case 'Appointment':
        // For appointments, we update the related professional/clinic doctor
        const appointmentResult = await db.query(`
          SELECT professional_id, clinic_doctor_id 
          FROM appointments 
          WHERE appointment_id = $1
        `, params);
        
        if (appointmentResult.rows.length > 0) {
          const { professional_id, clinic_doctor_id } = appointmentResult.rows[0];
          
          if (professional_id) {
            await updateTargetRatings('Professional', professional_id);
          } else if (clinic_doctor_id) {
            await updateTargetRatings('ClinicDoctor', clinic_doctor_id);
          }
        }
        return;
      default:
        return;
    }

    await db.query(query, params);
  } catch (error) {
    console.error('Error updating target ratings:', error);
  }
};

// Create a new review
const createReview = async (req, res, next) => {
  try {
    const { target_type, target_id, rating, comment, appreciated_aspects, feedback_suggestions, is_verified_visit } = req.body;
    const patient_id = req.user.id; // Assuming JWT middleware sets req.user

    // Validate required fields
    if (!target_type || !target_id || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'target_type, target_id, and rating are required'
      });
    }

    // Validate rating
    if (!isValidRating(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Validate target_type
    const validTargetTypes = ['Professional', 'ClinicDoctor', 'Clinic', 'Appointment'];
    if (!validTargetTypes.includes(target_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target_type. Must be one of: Professional, ClinicDoctor, Clinic, Appointment'
      });
    }

    // Check if patient exists
    const patientResult = await db.query('SELECT patient_id FROM patients WHERE patient_id = $1', [patient_id]);
    if (patientResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only patients can submit reviews'
      });
    }

    // Check if target entity exists
    let targetExists = false;
    switch(target_type) {
      case 'Professional':
        const professionalResult = await db.query('SELECT professional_id FROM professionals WHERE professional_id = $1', [target_id]);
        targetExists = professionalResult.rows.length > 0;
        break;
      case 'ClinicDoctor':
        const clinicDoctorResult = await db.query('SELECT clinic_doctor_id FROM clinic_doctors WHERE clinic_doctor_id = $1', [target_id]);
        targetExists = clinicDoctorResult.rows.length > 0;
        break;
      case 'Clinic':
        const clinicResult = await db.query('SELECT clinic_id FROM clinics WHERE clinic_id = $1', [target_id]);
        targetExists = clinicResult.rows.length > 0;
        break;
      case 'Appointment':
        const appointmentResult = await db.query('SELECT appointment_id FROM appointments WHERE appointment_id = $1', [target_id]);
        targetExists = appointmentResult.rows.length > 0;
        break;
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${target_type} not found`
      });
    }

    // Check if patient is trying to review themselves
    if (target_type === 'Professional') {
      const professionalResult = await db.query(`
        SELECT user_id FROM professionals WHERE professional_id = $1
      `, [target_id]);
      
      if (professionalResult.rows.length > 0) {
        const professionalUserId = professionalResult.rows[0].user_id;
        const patientResult = await db.query(`
          SELECT user_id FROM patients WHERE patient_id = $1
        `, [patient_id]);
        
        if (patientResult.rows.length > 0 && patientResult.rows[0].user_id === professionalUserId) {
          return res.status(403).json({
            success: false,
            message: 'You cannot review yourself'
          });
        }
      }
    }

    // Check if user has already reviewed this entity
    const existingReview = await db.query(`
      SELECT review_id FROM reviews 
      WHERE patient_id = $1 AND target_type = $2 AND target_id = $3
    `, [patient_id, target_type, target_id]);

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this entity'
      });
    }

    // Check if comment is too long (limit to 1000 characters)
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be less than 1000 characters'
      });
    }

    // Generate UUID for the review
    const review_id_uuid = uuidv4();

    // Insert the review
    const insertQuery = `
      INSERT INTO reviews (
        review_id_uuid, patient_id, patient_id_uuid, rating, comment, 
        target_type, target_id, appreciated_aspects, feedback_suggestions, is_verified_visit
      ) 
      VALUES ($1, $2, (SELECT patient_id_uuid FROM patients WHERE patient_id = $2), $3, $4, $5, $6, $7, $8, $9)
      RETURNING review_id, created_at
    `;

    const insertParams = [
      review_id_uuid, patient_id, rating, comment || null, 
      target_type, target_id, appreciated_aspects || null, 
      feedback_suggestions || null, is_verified_visit || false
    ];

    const result = await db.query(insertQuery, insertParams);
    const review = result.rows[0];

    // Update target entity ratings
    await updateTargetRatings(target_type, target_id);

    // Get the target name for the response
    const target_name = await getTargetName(target_type, target_id);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        review_id: review.review_id,
        review_id_uuid,
        patient_id,
        target_type,
        target_id,
        rating,
        comment: comment || null,
        appreciated_aspects: appreciated_aspects || null,
        feedback_suggestions: feedback_suggestions || null,
        is_verified_visit: is_verified_visit || false,
        created_at: review.created_at
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    next(error);
  }
};

// Update an existing review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, appreciated_aspects, feedback_suggestions, is_verified_visit } = req.body;
    const patient_id = req.user.id; // Assuming JWT middleware sets req.user

    // Check if any update field is provided
    const hasUpdate = rating !== undefined || comment !== undefined || 
                      appreciated_aspects !== undefined || feedback_suggestions !== undefined || 
                      is_verified_visit !== undefined;

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    // Validate rating if provided
    if (rating !== undefined && !isValidRating(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Check if review exists and belongs to the user
    const reviewResult = await db.query(`
      SELECT review_id, patient_id, target_type, target_id 
      FROM reviews 
      WHERE review_id = $1
    `, [reviewId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const review = reviewResult.rows[0];
    if (review.patient_id !== patient_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Check if comment is too long (limit to 100 characters)
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be less than 1000 characters'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 2; // First param is reviewId

    if (rating !== undefined) {
      updateFields.push(`rating = $${paramIndex}`);
      updateParams.push(rating);
      paramIndex++;
    }

    if (comment !== undefined) {
      updateFields.push(`comment = $${paramIndex}`);
      updateParams.push(comment);
      paramIndex++;
    }

    if (appreciated_aspects !== undefined) {
      updateFields.push(`appreciated_aspects = $${paramIndex}`);
      updateParams.push(appreciated_aspects);
      paramIndex++;
    }

    if (feedback_suggestions !== undefined) {
      updateFields.push(`feedback_suggestions = $${paramIndex}`);
      updateParams.push(feedback_suggestions);
      paramIndex++;
    }

    if (is_verified_visit !== undefined) {
      updateFields.push(`is_verified_visit = $${paramIndex}`);
      updateParams.push(is_verified_visit);
      paramIndex++;
    }

    // Add updated_at field
    updateFields.push(`updated_at = NOW()`);

    // Add reviewId as the last parameter
    updateParams.push(reviewId);

    const updateQuery = `
      UPDATE reviews 
      SET ${updateFields.join(', ')}
      WHERE review_id = $${paramIndex}
      RETURNING review_id, review_id_uuid, patient_id, target_type, target_id, 
                rating, comment, appreciated_aspects, feedback_suggestions, 
                is_verified_visit, created_at, updated_at
    `;

    const result = await db.query(updateQuery, updateParams);
    const updatedReview = result.rows[0];

    // Update target entity ratings
    await updateTargetRatings(review.target_type, review.target_id);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    next(error);
 }
};

// Delete a review
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const patient_id = req.user.id; // Assuming JWT middleware sets req.user

    // Check if review exists and belongs to the user
    const reviewResult = await db.query(`
      SELECT review_id, target_type, target_id 
      FROM reviews 
      WHERE review_id = $1 AND patient_id = $2
    `, [reviewId, patient_id]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or does not belong to you'
      });
    }

    const review = reviewResult.rows[0];

    // Delete the review
    await db.query('DELETE FROM reviews WHERE review_id = $1', [reviewId]);

    // Update target entity ratings
    await updateTargetRatings(review.target_type, review.target_id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      deleted_review_id: reviewId
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    next(error);
  }
};

// Get reviews by the logged-in user
const getMyReviews = async (req, res, next) => {
 try {
    const patient_id = req.user.id; // Assuming JWT middleware sets req.user
    const { target_type, limit = 50, offset = 0, order_by = 'created_at', order_direction = 'DESC' } = req.query;

    // Validate query parameters
    const validOrderBy = ['created_at', 'rating'];
    const validOrderDirection = ['ASC', 'DESC'];
    const validTargetTypes = ['Professional', 'ClinicDoctor', 'Clinic', 'Appointment'];

    if (!validOrderBy.includes(order_by)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order_by parameter. Must be one of: created_at, rating'
      });
    }

    if (!validOrderDirection.includes(order_direction)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order_direction parameter. Must be one of: ASC, DESC'
      });
    }

    if (target_type && !validTargetTypes.includes(target_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target_type parameter. Must be one of: Professional, ClinicDoctor, Clinic, Appointment'
      });
    }

    // Validate limit and offset
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 100'
      });
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Offset must be a non-negative number'
      });
    }

    // Build query with optional target_type filter
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE patient_id = $1';
    let reviewsQuery = `
      SELECT review_id, review_id_uuid, target_type, target_id, rating, comment, 
             appreciated_aspects, feedback_suggestions, is_verified_visit, 
             created_at, updated_at
      FROM reviews 
      WHERE patient_id = $1
    `;
    let queryParams = [patient_id];
    let paramIndex = 2;

    if (target_type) {
      countQuery += ` AND target_type = $${paramIndex}`;
      reviewsQuery += ` AND target_type = $${paramIndex}`;
      queryParams.push(target_type);
      paramIndex++;
    }

    reviewsQuery += ` ORDER BY ${order_by} ${order_direction} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limitNum, offsetNum);

    // Get total count
    const countResult = await db.query(countQuery, queryParams.slice(0, paramIndex - 2));
    const total = parseInt(countResult.rows[0].count);

    // Get reviews
    const reviewsResult = await db.query(reviewsQuery, queryParams);

    // Add target names to each review
    const reviewsWithNames = await Promise.all(reviewsResult.rows.map(async (review) => {
      const target_name = await getTargetName(review.target_type, review.target_id);
      return {
        ...review,
        target_name
      };
    }));

    res.status(200).json({
      success: true,
      total,
      limit: limitNum,
      offset: offsetNum,
      reviews: reviewsWithNames
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    next(error);
  }
};

// Get a specific review by ID
const getReviewById = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const reviewResult = await db.query(`
      SELECT review_id, review_id_uuid, patient_id, target_type, target_id, 
             rating, comment, appreciated_aspects, feedback_suggestions, 
             is_verified_visit, created_at, updated_at
      FROM reviews 
      WHERE review_id = $1
    `, [reviewId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const review = reviewResult.rows[0];

    // Get patient and target names
    const patient_name = await getPatientName(review.patient_id);
    const target_name = await getTargetName(review.target_type, review.target_id);

    res.status(200).json({
      success: true,
      review: {
        ...review,
        patient_name,
        target_name
      }
    });
  } catch (error) {
    console.error('Error getting review by ID:', error);
    next(error);
  }
};

module.exports = {
 createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getReviewById
};