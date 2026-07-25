const validateQuizJSON = (data) => {
  const errors = [];

  if (!data.quizName || typeof data.quizName !== 'string' || data.quizName.trim() === '') {
    errors.push('Quiz name is required and must be a string.');
  }

  if (data.duration === undefined || typeof data.duration !== 'number' || data.duration <= 0) {
    errors.push('Duration is required and must be a positive number.');
  }

  if (data.positiveMarking === undefined || typeof data.positiveMarking !== 'number' || data.positiveMarking < 0) {
    errors.push('Positive marking is required and must be a non-negative number.');
  }

  if (data.negativeMarking === undefined || typeof data.negativeMarking !== 'number' || data.negativeMarking < 0) {
    errors.push('Negative marking is required and must be a non-negative number.');
  }

  if (!data.syllabus || typeof data.syllabus !== 'object') {
    errors.push('Syllabus is required and must be an object.');
  } else {
    const validSections = ['generalIntelligenceReasoning', 'generalAwareness', 'quantitativeAptitude', 'englishComprehension'];
    validSections.forEach(section => {
      if (data.syllabus[section] && !Array.isArray(data.syllabus[section])) {
        errors.push(`Syllabus section "${section}" must be an array of strings.`);
      }
    });
  }

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('Root: "questions" must be a non-empty array.');
  } else {
    data.questions.forEach((q, idx) => {
      const qNum = q.questionNumber || (idx + 1);
      
      if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
        errors.push(`Question ${qNum}: Question text is required.`);
      }

      const validSections = ['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'];
      if (!q.section || !validSections.includes(q.section)) {
        errors.push(`Question ${qNum}: Section must be one of [${validSections.join(', ')}].`);
      }

      if (!q.topic || typeof q.topic !== 'string' || q.topic.trim() === '') {
        errors.push(`Question ${qNum}: Topic is required.`);
      }

      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (!q.difficulty || !validDifficulties.includes(q.difficulty)) {
        errors.push(`Question ${qNum}: Difficulty must be one of [${validDifficulties.join(', ')}].`);
      }

      if (!q.options || typeof q.options !== 'object') {
        errors.push(`Question ${qNum}: Options must be an object.`);
      } else {
        const optionKeys = ['A', 'B', 'C', 'D'];
        optionKeys.forEach(key => {
          if (!q.options[key] || typeof q.options[key] !== 'string' || q.options[key].trim() === '') {
            errors.push(`Question ${qNum}: Option ${key} is required.`);
          }
        });
      }

      const validCorrectOptions = ['A', 'B', 'C', 'D'];
      if (!q.correctOption || !validCorrectOptions.includes(q.correctOption)) {
        errors.push(`Question ${qNum}: Correct option must be one of [${validCorrectOptions.join(', ')}].`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = { validateQuizJSON };
