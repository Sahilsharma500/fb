const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  adminLogin
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getUserProfile);

module.exports = router;
