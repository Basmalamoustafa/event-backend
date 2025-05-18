const userController = require('../src/controllers/userController');
const User = require('../src/models/User');

jest.mock('../src/models/User');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users without passwords', async () => {
      const users = [{ name: 'Test', email: 'test@test.com', role: 'user' }];
      User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(users) });

      await userController.getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle errors', async () => {
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('fail')) });

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });

  describe('getAdmins', () => {
    it('should return admins without passwords', async () => {
      const admins = [{ name: 'Admin', email: 'admin@test.com', role: 'admin' }];
      User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(admins) });

      await userController.getAdmins(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(res.json).toHaveBeenCalledWith(admins);
    });

    it('should handle errors', async () => {
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('fail')) });

      await userController.getAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });
});