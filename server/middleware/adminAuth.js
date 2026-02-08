const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user && user.isAdmin) {
      req.user = user; // Attach user to request for controllers
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admins only" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = adminAuth;
