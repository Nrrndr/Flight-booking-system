const { login } = require('../src/modules/authModule');
const db = require('../src/config/db');
const bcrypt = require('bcrypt');
jest.mock('../src/config/db', () => {
  return {
    queryAsync: jest.fn()
  };
});
jest.mock('bcrypt');
const mockUser = {
  UserID: 'test_user',
  Username: 'test_user',
  Email: 'j@gmail.com',
  Role: 'user'
};
const mockAdmin = {
  UserID: 'test_user',
  Username: 'test_user',
  Email: 'j@gmail.com',
  Role: 'admin'
};
describe('login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: 'test_user',
        password: 'test'
      },
      session: { save: jest.fn() }
    };
    res = {
      send: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => res)
    };
  });

  it('harus mengembalikan error username tidak ditemukan', async () => {
    db.queryAsync.mockResolvedValue([]);

    await login(req, res);
    expect(res.send).toHaveBeenCalledWith('Username tidak ditemukan');
  });
  it('harus mengembalikan error password salah', async () => {
    db.queryAsync.mockResolvedValue([mockUser]);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);
    expect(res.send).toHaveBeenCalledWith('Password salah');
  });
  it('harus mengembalikan sebagai user', async () => {
    db.queryAsync.mockResolvedValue([mockUser]);
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/user');
  });
  it('harus mengembalikan sebagai admin', async () => {
    db.queryAsync.mockResolvedValue([mockAdmin]);
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/admin');
  });
  it('harus menangani server error', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    db.queryAsync.mockRejectedValue(new Error('DB error'));

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Terjadi kesalahan saat login');
  });
});
