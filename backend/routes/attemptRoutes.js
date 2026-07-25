const express = require('express');
const router = express.Router();
const {
  submitAttempt,
  getAttempts,
  getAttemptById,
  getDashboardStats,
  getAnalytics,
  getAdminStats
} = require('../controllers/attemptController');
const { protect } = require('../middlewares/authMiddleware');

// Apply protection to all attempt routes
router.use(protect);

router.route('/')
  .post(submitAttempt)
  .get(getAttempts);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/analytics', getAnalytics);
router.get('/admin/stats', getAdminStats);
router.get('/:id', getAttemptById);

module.exports = router;
