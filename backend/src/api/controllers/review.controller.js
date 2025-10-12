const pool = require('../../config/db');

exports.createReview = async (req, res) => {
  const { appointment_id, rating, comment } = req.body;
  const patient_id = req.user.id;

  try {
    const newReview = await pool.query(
      'INSERT INTO reviews (appointment_id, patient_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [appointment_id, patient_id, rating, comment]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getReviews = async (req, res) => {
  const { clinic_id, professional_id } = req.query;

  try {
    let query = 'SELECT * FROM reviews';
    const values = [];

    if (clinic_id) {
      query += ' WHERE appointment_id IN (SELECT id FROM appointments WHERE clinic_id = $1)';
      values.push(clinic_id);
    } else if (professional_id) {
      query += ' WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = $1)';
      values.push(professional_id);
    }

    const reviews = await pool.query(query, values);

    res.json(reviews.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
