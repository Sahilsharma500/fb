const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Submit a quiz attempt
// @route   POST /api/attempts
// @access  Private
const submitAttempt = async (req, res, next) => {
  try {
    const { quizId, answers: userAnswers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    const positiveMarking = quiz.positiveMarking;
    const negativeMarking = quiz.negativeMarking;
    const totalQuestions = quiz.questions.length;

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;

    const answersRecord = [];
    const sectionStats = {
      'General Intelligence & Reasoning': { correct: 0, wrong: 0, skipped: 0, score: 0 },
      'General Awareness': { correct: 0, wrong: 0, skipped: 0, score: 0 },
      'Quantitative Aptitude': { correct: 0, wrong: 0, skipped: 0, score: 0 },
      'English Comprehension': { correct: 0, wrong: 0, skipped: 0, score: 0 }
    };

    // Process questions
    quiz.questions.forEach(q => {
      const userAns = userAnswers.find(ua => ua.questionNumber === q.questionNumber);
      const selectedOption = userAns ? userAns.selectedOption : null;
      const status = userAns ? userAns.status : 'skipped';

      const isSkipped = !selectedOption || status === 'skipped' || status === 'not-visited';
      let isCorrect = false;
      let qScore = 0;

      if (isSkipped) {
        skippedAnswers++;
        sectionStats[q.section].skipped++;
      } else {
        isCorrect = selectedOption === q.correctOption;
        if (isCorrect) {
          correctAnswers++;
          qScore = positiveMarking;
          sectionStats[q.section].correct++;
        } else {
          wrongAnswers++;
          qScore = -negativeMarking;
          sectionStats[q.section].wrong++;
        }
      }

      score += qScore;
      sectionStats[q.section].score += qScore;

      answersRecord.push({
        questionNumber: q.questionNumber,
        section: q.section,
        topic: q.topic,
        selectedOption,
        correctOption: q.correctOption,
        isCorrect,
        status: isSkipped ? 'skipped' : status
      });
    });

    const attemptedCount = correctAnswers + wrongAnswers;
    const accuracy = attemptedCount > 0 ? Math.round((correctAnswers / attemptedCount) * 100) : 0;

    // Build section performance array
    const sectionPerformance = Object.keys(sectionStats).map(secName => ({
      sectionName: secName,
      correct: sectionStats[secName].correct,
      wrong: sectionStats[secName].wrong,
      skipped: sectionStats[secName].skipped,
      score: sectionStats[secName].score
    }));

    const attempt = await Attempt.create({
      user: req.user._id,
      quiz: quiz._id,
      quizName: quiz.quizName,
      score,
      accuracy,
      timeTaken,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      answers: answersRecord,
      sectionPerformance
    });

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for current user
// @route   GET /api/attempts
// @access  Private
const getAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single attempt details (with explanations)
// @route   GET /api/attempts/:id
// @access  Private
const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id });

    if (!attempt) {
      res.statusCode = 404;
      throw new Error('Attempt details not found');
    }

    // Retrieve quiz questions to show explanations and choices
    const quiz = await Quiz.findById(attempt.quiz);

    // Merge explanation and original question options into answer details for review
    const enrichedAnswers = attempt.answers.map(ans => {
      const originalQ = quiz ? quiz.questions.find(q => q.questionNumber === ans.questionNumber) : null;
      return {
        questionNumber: ans.questionNumber,
        section: ans.section,
        topic: ans.topic,
        selectedOption: ans.selectedOption,
        correctOption: ans.correctOption,
        isCorrect: ans.isCorrect,
        status: ans.status,
        questionText: originalQ ? originalQ.question : 'Question content unavailable',
        options: originalQ ? originalQ.options : { A: '', B: '', C: '', D: '' },
        explanation: originalQ ? originalQ.explanation : 'Explanation unavailable',
        source: originalQ ? originalQ.source : ''
      };
    });

    res.json({
      success: true,
      data: {
        _id: attempt._id,
        quiz: attempt.quiz,
        quizName: attempt.quizName,
        score: attempt.score,
        accuracy: attempt.accuracy,
        timeTaken: attempt.timeTaken,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        skippedAnswers: attempt.skippedAnswers,
        sectionPerformance: attempt.sectionPerformance,
        createdAt: attempt.createdAt,
        answers: enrichedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary statistics for dashboard
// @route   GET /api/attempts/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalQuizzes = await Quiz.countDocuments({});
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    let bestScore = 0;
    let avgScore = 0;

    if (totalAttempts > 0) {
      bestScore = Math.max(...attempts.map(a => a.score));
      const totalScoreSum = attempts.reduce((acc, curr) => acc + curr.score, 0);
      avgScore = Math.round((totalScoreSum / totalAttempts) * 10) / 10;
    }

    // Get recent 5 attempts
    const recentAttempts = attempts.slice(0, 5).map(a => ({
      _id: a._id,
      quizName: a.quizName,
      score: a.score,
      accuracy: a.accuracy,
      createdAt: a.createdAt,
      totalQuestions: a.totalQuestions
    }));

    res.json({
      success: true,
      data: {
        totalQuizzes,
        totalAttempts,
        bestScore,
        avgScore,
        recentAttempts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed performance analytics
// @route   GET /api/attempts/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: 1 }); // Ascending for chronological order in charts

    // Chronological Score Trend
    const scoreTrend = attempts.map((a, index) => ({
      attemptNumber: index + 1,
      quizName: a.quizName,
      score: a.score,
      accuracy: a.accuracy,
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Section/Subject wise performance
    const subjectStats = {
      'General Intelligence & Reasoning': { correct: 0, attempted: 0, total: 0 },
      'General Awareness': { correct: 0, attempted: 0, total: 0 },
      'Quantitative Aptitude': { correct: 0, attempted: 0, total: 0 },
      'English Comprehension': { correct: 0, attempted: 0, total: 0 }
    };

    const topicStats = {};

    attempts.forEach(attempt => {
      attempt.answers.forEach(ans => {
        const sec = ans.section;
        const top = ans.topic;

        // Initialize topic stats if not present
        if (!topicStats[sec]) {
          topicStats[sec] = {};
        }
        if (!topicStats[sec][top]) {
          topicStats[sec][top] = { correct: 0, attempted: 0, total: 0 };
        }

        // Increment counts
        subjectStats[sec].total++;
        topicStats[sec][top].total++;

        if (ans.status !== 'skipped' && ans.selectedOption) {
          subjectStats[sec].attempted++;
          topicStats[sec][top].attempted++;

          if (ans.isCorrect) {
            subjectStats[sec].correct++;
            topicStats[sec][top].correct++;
          }
        }
      });
    });

    // Accuracy by subject
    const accuracyBySubject = Object.keys(subjectStats).map(subject => {
      const stats = subjectStats[subject];
      const acc = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
      return {
        subject,
        accuracy: acc,
        correct: stats.correct,
        attempted: stats.attempted,
        total: stats.total
      };
    });

    // Topic performance breakdown
    const topicBreakdown = [];
    const strongTopics = [];
    const weakTopics = [];

    Object.keys(topicStats).forEach(sec => {
      Object.keys(topicStats[sec]).forEach(top => {
        const stats = topicStats[sec][top];
        const acc = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
        
        const topicData = {
          section: sec,
          topic: top,
          accuracy: acc,
          correct: stats.correct,
          attempted: stats.attempted,
          total: stats.total
        };

        topicBreakdown.push(topicData);

        // Classify weak vs strong (only classify if attempted at least 3 questions to be statistically meaningful)
        if (stats.attempted >= 2) {
          if (acc >= 75) {
            strongTopics.push(topicData);
          } else if (acc < 50) {
            weakTopics.push(topicData);
          }
        }
      });
    });

    // Sort breakdowns
    topicBreakdown.sort((a, b) => b.accuracy - a.accuracy);
    strongTopics.sort((a, b) => b.accuracy - a.accuracy);
    weakTopics.sort((a, b) => a.accuracy - b.accuracy);

    res.json({
      success: true,
      data: {
        scoreTrend,
        accuracyBySubject,
        topicBreakdown,
        strongTopics: strongTopics.slice(0, 8),
        weakTopics: weakTopics.slice(0, 8)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary statistics for admin dashboard
// @route   GET /api/attempts/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized as an admin');
    }

    // 1. Quizzes created by this admin
    const quizIds = await Quiz.find({ createdBy: req.user._id }).distinct('_id');
    const totalQuizzes = quizIds.length;

    // 2. Total attempts on these quizzes
    const totalAttempts = await Attempt.countDocuments({ quiz: { $in: quizIds } });

    // 3. Average score on these quizzes
    const attempts = await Attempt.find({ quiz: { $in: quizIds } });
    let avgScore = 0;
    if (attempts.length > 0) {
      const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
      avgScore = Math.round((sum / attempts.length) * 10) / 10;
    }

    // 4. Unique users who attempted these quizzes
    const uniqueUsersCount = await Attempt.find({ quiz: { $in: quizIds } }).distinct('user');
    const totalCandidates = uniqueUsersCount.length;

    // 5. Recent attempts on these quizzes (with user names)
    const recentAttempts = await Attempt.find({ quiz: { $in: quizIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    res.json({
      success: true,
      data: {
        totalQuizzes,
        totalAttempts,
        avgScore,
        totalCandidates,
        recentAttempts: recentAttempts.map(a => ({
          _id: a._id,
          quizName: a.quizName,
          userName: a.user ? a.user.name : 'Unknown User',
          userEmail: a.user ? a.user.email : '',
          score: a.score,
          accuracy: a.accuracy,
          timeTaken: a.timeTaken,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAttempt,
  getAttempts,
  getAttemptById,
  getDashboardStats,
  getAnalytics,
  getAdminStats
};
