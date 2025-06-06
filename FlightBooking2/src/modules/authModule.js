const bcrypt = require('bcrypt');
const db = require('../config/db');
/* eslint-disable no-console*/

exports.register = async (req, res) => {
  const { username, email, phoneNumber, password, confirmPassword } = req.body;
  if (!username || !email || !password) return res.send('Semua field harus diisi');
  if (password !== confirmPassword) return res.send('Password tidak sesuai');

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.queryAsync(
      'INSERT INTO Users (username, email, PhoneNumber, PasswordHash, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, phoneNumber, hashedPassword, 'user']
    );
    res.redirect('/');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.send('Username atau email sudah terdaftar');
    }
    return res.status(500).send('Terjadi kesalahan pada server');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const results = await db.queryAsync('SELECT * FROM Users WHERE Username = ?', [username]);
    if (results.length === 0) return res.status(401).send('Username tidak ditemukan');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(401).send('Password salah');

    req.session.user = {
      id: user.UserID,
      username: user.Username,
      email: user.Email,
      role: user.Role
    };
    req.session.save();

    return res.redirect(user.Role === 'admin' ? '/admin' : '/user');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Terjadi kesalahan saat login');
  }
};
