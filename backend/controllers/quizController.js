const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const { validateQuizJSON } = require('../utils/validation');

// @desc    Get all quizzes with user attempt statistics
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 });

    // Aggregate attempts for this user to get attemptsCount and highestScore
    const stats = await Attempt.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$quiz',
          attemptsCount: { $sum: 1 },
          highestScore: { $max: '$score' }
        }
      }
    ]);

    // Map stats to a dictionary for O(1) lookup
    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        attemptsCount: stat.attemptsCount,
        highestScore: stat.highestScore
      };
    });

    const quizzesWithStats = quizzes.map(quiz => {
      const quizId = quiz._id.toString();
      const quizStat = statsMap[quizId] || { attemptsCount: 0, highestScore: null };
      return {
        _id: quiz._id,
        quizName: quiz.quizName,
        description: quiz.description,
        duration: quiz.duration,
        positiveMarking: quiz.positiveMarking,
        negativeMarking: quiz.negativeMarking,
        syllabus: quiz.syllabus,
        tags: quiz.tags,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
        attemptsCount: quizStat.attemptsCount,
        highestScore: quizStat.highestScore
      };
    });

    res.json({
      success: true,
      count: quizzesWithStats.length,
      data: quizzesWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single quiz details (including questions)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new quiz (manually or via form)
// @route   POST /api/quizzes
// @access  Private
const createQuiz = async (req, res, next) => {
  try {
    const {
      quizName,
      description,
      duration,
      positiveMarking,
      negativeMarking,
      syllabus,
      tags,
      questions
    } = req.body;

    // Validate request body structure
    const validation = validateQuizJSON({
      quizName,
      duration,
      positiveMarking,
      negativeMarking,
      syllabus,
      questions
    });

    if (!validation.isValid) {
      res.statusCode = 400;
      throw new Error(`Validation Error: ${validation.errors.join(' | ')}`);
    }

    const quiz = await Quiz.create({
      quizName,
      description,
      duration,
      positiveMarking,
      negativeMarking,
      syllabus,
      tags: tags || [],
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import quiz from JSON
// @route   POST /api/quizzes/import
// @access  Private
const importQuiz = async (req, res, next) => {
  try {
    const quizJSON = req.body;

    const validation = validateQuizJSON(quizJSON);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'JSON Validation failed',
        errors: validation.errors
      });
    }

    const quiz = await Quiz.create({
      quizName: quizJSON.quizName,
      description: quizJSON.description || 'Imported Quiz',
      duration: quizJSON.duration,
      positiveMarking: quizJSON.positiveMarking,
      negativeMarking: quizJSON.negativeMarking,
      syllabus: {
        generalIntelligenceReasoning: quizJSON.syllabus?.generalIntelligenceReasoning || [],
        generalAwareness: quizJSON.syllabus?.generalAwareness || [],
        quantitativeAptitude: quizJSON.syllabus?.quantitativeAptitude || [],
        englishComprehension: quizJSON.syllabus?.englishComprehension || []
      },
      tags: quizJSON.tags || ['Imported'],
      questions: quizJSON.questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz imported successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private
const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    const {
      quizName,
      description,
      duration,
      positiveMarking,
      negativeMarking,
      syllabus,
      tags,
      questions
    } = req.body;

    // Validate structure
    const validation = validateQuizJSON({
      quizName,
      duration,
      positiveMarking,
      negativeMarking,
      syllabus,
      questions
    });

    if (!validation.isValid) {
      res.statusCode = 400;
      throw new Error(`Validation Error: ${validation.errors.join(' | ')}`);
    }

    quiz.quizName = quizName;
    quiz.description = description || '';
    quiz.duration = duration;
    quiz.positiveMarking = positiveMarking;
    quiz.negativeMarking = negativeMarking;
    quiz.syllabus = syllabus;
    quiz.tags = tags || [];
    quiz.questions = questions;

    await quiz.save();

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    // Delete attempts associated with this quiz too, to keep DB clean
    await Attempt.deleteMany({ quiz: req.params.id, user: req.user._id });

    // Use deleteOne instead of remove (since remove() is deprecated in newer mongoose versions)
    await Quiz.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Quiz and associated attempts deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a quiz
// @route   POST /api/quizzes/:id/duplicate
// @access  Private
const duplicateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    const duplicatedQuiz = await Quiz.create({
      quizName: `${quiz.quizName} (Copy)`,
      description: quiz.description,
      duration: quiz.duration,
      positiveMarking: quiz.positiveMarking,
      negativeMarking: quiz.negativeMarking,
      syllabus: quiz.syllabus,
      tags: [...quiz.tags, 'Duplicate'],
      questions: quiz.questions.map(q => ({
        questionNumber: q.questionNumber,
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        source: q.source
      })),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz duplicated successfully',
      data: duplicatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard for a specific quiz
// @route   GET /api/quizzes/:id/leaderboard
// @access  Private
const getQuizLeaderboard = async (req, res, next) => {
  try {
    const quizId = req.params.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.statusCode = 404;
      throw new Error('Quiz not found');
    }

    const mongoose = require('mongoose');
    const leaderboard = await Attempt.aggregate([
      { $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
      // Sort by score descending, then timeTaken ascending (lower is better)
      { $sort: { score: -1, timeTaken: 1, createdAt: 1 } },
      // Group by user to pick the best attempt for each user
      {
        $group: {
          _id: '$user',
          highestScore: { $first: '$score' },
          accuracy: { $first: '$accuracy' },
          timeTaken: { $first: '$timeTaken' },
          createdAt: { $first: '$createdAt' },
          attemptId: { $first: '$_id' }
        }
      },
      // Join with users table to get the user's name
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      // Project the desired fields
      {
        $project: {
          _id: 1,
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          score: '$highestScore',
          accuracy: 1,
          timeTaken: 1,
          createdAt: 1,
          attemptId: 1
        }
      },
      // Sort the final leaderboard by score descending, then timeTaken ascending
      { $sort: { score: -1, timeTaken: 1 } }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  importQuiz,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz,
  getQuizLeaderboard
};
const _ = undefined;
