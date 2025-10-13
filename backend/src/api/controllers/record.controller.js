const pool = require('../../config/db');

exports.uploadRecord = async (req, res) => {
  const { patient_id, record_url } = req.body;

  try {
    const newRecord = await pool.query(
      'INSERT INTO medical_records (patient_id, record_url) VALUES ($1, $2) RETURNING *',
      [patient_id, record_url]
    );

    res.status(201).json(newRecord.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getRecords = async (req, res) => {
  try {
    const records = await pool.query('SELECT * FROM medical_records WHERE patient_id = $1', [req.user.id]);
    res.json(records.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteRecord = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM medical_records WHERE id = $1 AND patient_id = $2', [id, req.user.id]);
    res.json({ message: 'Medical record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
