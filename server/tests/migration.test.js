const mongoose = require('mongoose');
const User = require('../models/User');
const migrate = require('../scripts/migrate_super_admin');

describe('Super Admin Migration', () => {
  it('should promote the user to Super Admin', async () => {
    const email = 'agyakwesiadom@gmail.com';
    const user = new User({
      email: email,
      username: 'testadmin',
      password: 'password123',
      isAdmin: false,
      isSuperAdmin: false
    });
    await user.save();

    // Call migrate without arguments. It will use the existing connection.
    await migrate();

    const updatedUser = await User.findOne({ email });
    expect(updatedUser.isSuperAdmin).toBe(true);
    expect(updatedUser.isAdmin).toBe(true);
  });
});
