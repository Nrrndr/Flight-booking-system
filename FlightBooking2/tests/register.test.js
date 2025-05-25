const { register } = require('../modules/authModule');
const db = require('../config/db');
const bcrypt = require('bcrypt');

jest.mock('../config/db', () => {
  return {
    queryAsync: jest.fn(),
  };
});
jest.mock('bcrypt');

describe('register', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        phoneNumber: '08123456789',
        password: 'password123',
        confirmPassword: 'password123',
      },
    };
    res = {
      send: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it('harus mengembalikan error jika terdapat field kosong', async () => {
    req.body.username = '';

    await register(req, res);
    expect(res.send).toHaveBeenCalledWith('Semua field harus diisi');
  });

  it('harus mengembalikan error jika password tidak sesuai', async () => {
    req.body.confirmPassword = 'different';

    await register(req, res);
    expect(res.send).toHaveBeenCalledWith('Password tidak sesuai');
  });

  it('harus melakukan hash password dan menyimpan data user ke database', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    db.queryAsync.mockResolvedValue();

    await register(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(db.queryAsync).toHaveBeenCalledWith(
      'INSERT INTO users (username, email, PhoneNumber, PasswordHash, role) VALUES (?, ?, ?, ?, ?)',
      [
        'testuser',
        'test@example.com',
        '08123456789',
        'hashedPassword123',
        'user',
      ]
    );
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('harus mengembalikan error jika duplikat data (username atau email)', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    db.queryAsync.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

    await register(req, res);
    expect(res.send).toHaveBeenCalledWith(
      'Username atau email sudah terdaftar'
    );
  });

  it('harus menangani server error', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    db.queryAsync.mockRejectedValue(new Error('DB error'));

    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Terjadi kesalahan pada server');
  });
});
