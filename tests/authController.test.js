const authController = require('../src/controllers/authController');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/User');
jest.mock('jsonwebtoken');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      req.body = { name: 'Test', email: 'test@test.com', password: 'pass' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: '1', name: 'Test', email: 'test@test.com', role: 'user' });
      jwt.sign.mockReturnValue('mocktoken');

      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(User.create).toHaveBeenCalledWith({ name: 'Test', email: 'test@test.com', password: 'pass' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mocktoken',
        user: expect.objectContaining({ name: 'Test', email: 'test@test.com', role: 'user' }),
      }));
    });

    it('should not register if email exists', async () => {
      req.body = { name: 'Test', email: 'test@test.com', password: 'pass' };
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Email already in use' });
    });

    it('should handle errors', async () => {
      req.body = { name: 'Test', email: 'test@test.com', password: 'pass' };
      User.findOne.mockRejectedValue(new Error('fail'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'fail' }));
    });
  });

  describe('login', () => {
    it('should login a user and return token', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      const user = {
        _id: '1',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);
      jwt.sign.mockReturnValue('mocktoken');

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(user.comparePassword).toHaveBeenCalledWith('pass');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mocktoken',
        user: expect.objectContaining({ name: 'Test', email: 'test@test.com', role: 'user' }),
      }));
    });

    it('should not login with invalid credentials (no user)', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should not login with invalid credentials (bad password)', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      const user = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(user);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should handle errors', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      User.findOne.mockRejectedValue(new Error('fail'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'fail' }));
    });
  });

  describe('promoteUser', () => {
    it('should not allow self-promotion', async () => {
      req.params = { id: '1' };
      req.user = { id: '1' };

      await authController.promoteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "You’re already an admin!" });
    });

    it('should promote a user to admin', async () => {
      req.params = { id: '2' };
      req.user = { id: '1' };
      const updatedUser = { _id: '2', email: 'user2@test.com', role: 'admin' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await authController.promoteUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '2',
        { role: 'admin' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: `${updatedUser.email} is now an admin.`,
        user: updatedUser,
      }));
    });

    it('should handle user not found', async () => {
      req.params = { id: '2' };
      req.user = { id: '1' };
      User.findByIdAndUpdate.mockResolvedValue(null);

      await authController.promoteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not found' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);
      req.params = { id: '2' };
      req.user = { id: '1' };
      User.findByIdAndUpdate.mockRejectedValue(new Error('fail'));

      try {
        await authController.promoteUser(req, res);
      } catch (e) {
        // Prevent unhandled promise rejection
      }

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'fail' }));
    });
  });
});