const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.statusCode = 400;
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.statusCode = 400;
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.statusCode = 401;
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.json({
        success: true,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.statusCode = 404;
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login with password only
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res, next) => {
  const { password } = req.body;

  try {
    if (!password) {
      res.statusCode = 400;
      throw new Error('Please enter a password');
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      res.json({
        success: true,
        token: generateToken('admin'),
        user: {
          _id: '507f1f77bcf86cd799439011', // Fixed 24-char ObjectId
          name: 'Administrator',
          email: 'admin@ssc.mock',
          role: 'admin'
        }
      });
    } else {
      res.statusCode = 401;
      throw new Error('Invalid admin password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  adminLogin
};
