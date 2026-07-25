const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension']
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  question: {
    type: String,
    required: true
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctOption: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  explanation: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  }
});

const QuizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: [true, 'Please add a quiz name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    required: [true, 'Please add a duration in minutes'],
    default: 60
  },
  positiveMarking: {
    type: Number,
    required: true,
    default: 2
  },
  negativeMarking: {
    type: Number,
    required: true,
    default: 0.5
  },
  syllabus: {
    generalIntelligenceReasoning: [String],
    generalAwareness: [String],
    quantitativeAptitude: [String],
    englishComprehension: [String]
  },
  tags: [String],
  questions: [QuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
