const mongoose = require('mongoose');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

describe('Admin Auth Middleware', () => {
  it('should deny access to non-admin user', async () => {
    const user = new User({
      username: 'user',
      email: 'user@example.com',
      password: 'password',
      isAdmin: false
    });
    await user.save();

    const req = { userId: user._id };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access to admin user and attach user to req', async () => {
    const user = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      isAdmin: true
    });
    await user.save();

    const req = { userId: user._id };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await adminAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('admin@example.com');
  });

  it('should NOT auto-promote agyakwesiadom@gmail.com', async () => {
    const email = 'agyakwesiadom@gmail.com';
    const user = new User({
      username: 'target',
      email: email,
      password: 'password',
      isAdmin: false,
      isSuperAdmin: false
    });
    await user.save();

    const req = { userId: user._id };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await adminAuth(req, res, next);

    // Should still be forbidden because it wasn't promoted
    expect(res.status).toHaveBeenCalledWith(403);

    // Verify user in DB
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.isAdmin).toBe(false);
    expect(updatedUser.isSuperAdmin).toBe(false);
  });
});
