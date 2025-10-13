const pool = require('../../config/db');

exports.getProfessionals = async (req, res) => {
  const { specialty } = req.query;

  try {
    let query = 'SELECT * FROM professionals WHERE verification_status = $1';
    const values = ['Verified'];

    if (specialty) {
      query += ' AND specialty = $2';
      values.push(specialty);
    }

    const professionals = await pool.query(query, values);

    res.json(professionals.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    const availability = await pool.query(
      'SELECT * FROM availability_slots WHERE professional_id = $1 AND is_booked = false',
      [id]
    );

    res.json(availability.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
