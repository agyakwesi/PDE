const mongoose = require('mongoose');
const User = require('../models/User');
const adminController = require('../controllers/adminController');

describe('Admin Controller Role Management', () => {
  let superAdmin, admin, regularUser, targetSuperAdmin;

  beforeEach(async () => {
    // Clear DB
    await User.deleteMany({});

    // Create users
    superAdmin = await new User({
      username: 'super', email: 'super@test.com', password: 'pw', isAdmin: true, isSuperAdmin: true
    }).save();

    admin = await new User({
      username: 'admin', email: 'admin@test.com', password: 'pw', isAdmin: true, isSuperAdmin: false
    }).save();

    regularUser = await new User({
      username: 'user', email: 'user@test.com', password: 'pw', isAdmin: false, isSuperAdmin: false
    }).save();

    targetSuperAdmin = await new User({
      username: 'targetSA', email: 'targetSA@test.com', password: 'pw', isAdmin: true, isSuperAdmin: true
    }).save();
  });

  describe('updateUserRole', () => {
    it('should allow Super Admin to modify another Super Admin', async () => {
      const req = {
        params: { userId: targetSuperAdmin._id },
        body: { isSuspended: true },
        user: superAdmin
      };
      const res = { json: jest.fn() };

      await adminController.updateUserRole(req, res);

      const updated = await User.findById(targetSuperAdmin._id);
      expect(updated.isSuspended).toBe(true);
      expect(res.json).toHaveBeenCalled();
    });

    it('should prevent Regular Admin from modifying Super Admin', async () => {
      const req = {
        params: { userId: targetSuperAdmin._id },
        body: { isSuspended: true },
        user: admin
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await adminController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const updated = await User.findById(targetSuperAdmin._id);
      expect(updated.isSuspended).toBe(false);
    });

    it('should prevent Regular Admin from promoting to Super Admin', async () => {
      const req = {
        params: { userId: regularUser._id },
        body: { isSuperAdmin: true },
        user: admin
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await adminController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const updated = await User.findById(regularUser._id);
      expect(updated.isSuperAdmin).toBe(false);
    });

    it('should allow Super Admin to promote to Super Admin', async () => {
      const req = {
        params: { userId: regularUser._id },
        body: { isSuperAdmin: true },
        user: superAdmin
      };
      const res = { json: jest.fn() };

      await adminController.updateUserRole(req, res);

      const updated = await User.findById(regularUser._id);
      expect(updated.isSuperAdmin).toBe(true);
      expect(updated.isAdmin).toBe(true); // Implicit
    });
  });

  describe('deleteUser', () => {
    it('should prevent deletion of Super Admin by anyone', async () => {
      const req = {
        params: { userId: targetSuperAdmin._id },
        user: superAdmin // Even Super Admin cannot delete
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await adminController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const exists = await User.findById(targetSuperAdmin._id);
      expect(exists).toBeDefined();
    });

    it('should allow deletion of regular user', async () => {
      const req = {
        params: { userId: regularUser._id },
        user: admin
      };
      const res = { json: jest.fn() };

      await adminController.deleteUser(req, res);

      const exists = await User.findById(regularUser._id);
      expect(exists).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should prevent Regular Admin from creating Super Admin', async () => {
      const req = {
        body: {
          username: 'newSA',
          email: 'newSA@test.com',
          password: 'pw',
          isSuperAdmin: true
        },
        user: admin
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await adminController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const exists = await User.findOne({ email: 'newSA@test.com' });
      expect(exists).toBeNull();
    });

    it('should allow Super Admin to create Super Admin', async () => {
      const req = {
        body: {
          username: 'newSA',
          email: 'newSA@test.com',
          password: 'pw',
          isSuperAdmin: true
        },
        user: superAdmin
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await adminController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const exists = await User.findOne({ email: 'newSA@test.com' });
      expect(exists.isSuperAdmin).toBe(true);
      expect(exists.isAdmin).toBe(true);
    });
  });
});
