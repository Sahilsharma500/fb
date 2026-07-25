const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  importQuiz,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz,
  getQuizLeaderboard
} = require('../controllers/quizController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Apply protection to all quiz routes
router.use(protect);

router.get('/:id/leaderboard', getQuizLeaderboard);

router.route('/')
  .get(getQuizzes)
  .post(admin, createQuiz);

router.post('/import', admin, importQuiz);

router.route('/:id')
  .get(getQuizById)
  .put(admin, updateQuiz)
  .delete(admin, deleteQuiz);

router.post('/:id/duplicate', admin, duplicateQuiz);

module.exports = router;
