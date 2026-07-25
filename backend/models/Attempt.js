const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  section: { type: String, required: true },
  topic: { type: String, required: true },
  selectedOption: { type: String, default: null }, // 'A', 'B', 'C', 'D', or null
  correctOption: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['answered', 'marked', 'answered-marked', 'skipped', 'not-visited'],
    default: 'not-visited'
  }
});

const SectionPerformanceSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
});

const AttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  quizName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number, // Percentage 0 - 100
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  skippedAnswers: {
    type: Number,
    required: true
  },
  answers: [AnswerSchema],
  sectionPerformance: [SectionPerformanceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', AttemptSchema);
