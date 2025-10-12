const pool = require('../../config/db');

exports.getMe = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const updatedUser = await pool.query(
      'UPDATE users SET "fullName" = $1, "phoneNumber" = $2 WHERE id = $3 RETURNING id, email, role, "fullName", "phoneNumber"',
      [fullName, phoneNumber, req.user.id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
