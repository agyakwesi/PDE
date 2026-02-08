const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const migrate = async (uri) => {
  const dbAddress = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

  // Connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(dbAddress);
    console.log(`Connected to DB at ${dbAddress}`);
  }

  const email = 'agyakwesiadom@gmail.com';
  const user = await User.findOne({ email: email });

  if (user) {
    user.isAdmin = true;
    user.isSuperAdmin = true;
    await user.save();
    console.log(`Successfully migrated ${email} to Super Admin.`);
    return true;
  } else {
    console.log(`User ${email} not found.`);
    return false;
  }
};

if (require.main === module) {
  migrate()
    .then(() => {
        // Only close if we opened it (implied by script execution)
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = migrate;
