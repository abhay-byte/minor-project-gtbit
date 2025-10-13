const pool = require('../../config/db');

exports.searchClinics = async (req, res) => {
  const { lat, lon, radius, specialty } = req.query;

  try {
    let query = `
      SELECT *,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat ) ) ) ) AS distance
      FROM clinics
    `;
    const values = [lat, lon];

    if (specialty) {
      query += `
        JOIN clinic_doctors ON clinics.id = clinic_doctors.clinic_id
        JOIN professionals ON clinic_doctors.professional_id = professionals.id
        WHERE professionals.specialty = $3
      `;
      values.push(specialty);
    }

    query += ' HAVING distance < $4 ORDER BY distance';
    values.push(radius);

    const clinics = await pool.query(query, values);

    res.json(clinics.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getClinicById = async (req, res) => {
  const { id } = req.params;

  try {
    const clinic = await pool.query('SELECT * FROM clinics WHERE id = $1', [id]);

    if (clinic.rows.length === 0) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    const doctors = await pool.query(
      `SELECT p.* FROM professionals p
       JOIN clinic_doctors cd ON p.id = cd.professional_id
       WHERE cd.clinic_id = $1`,
      [id]
    );

    const clinicData = clinic.rows[0];
    clinicData.doctors = doctors.rows;

    res.json(clinicData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
