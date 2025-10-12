const pool = require('../../config/db');

exports.createAppointment = async (req, res) => {
  const { professional_id, availability_slot_id } = req.body;
  const patient_id = req.user.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create a new appointment
    const newAppointment = await client.query(
      'INSERT INTO appointments (patient_id, professional_id, availability_slot_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [patient_id, professional_id, availability_slot_id, 'upcoming']
    );

    // Mark the availability slot as booked
    await client.query(
      'UPDATE availability_slots SET is_booked = true WHERE id = $1',
      [availability_slot_id]
    );

    await client.query('COMMIT');

    res.status(201).json(newAppointment.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
};

exports.getMyAppointments = async (req, res) => {
  const { id, role } = req.user;
  const { status } = req.query;

  try {
    let query = 'SELECT * FROM appointments';
    const values = [];

    if (role === 'patient') {
      query += ' WHERE patient_id = $1';
      values.push(id);
    } else if (role === 'professional') {
      query += ' WHERE professional_id = $1';
      values.push(id);
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (status) {
      query += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    const appointments = await pool.query(query, values);

    res.json(appointments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
