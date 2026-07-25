import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  FileText,
  AlertTriangle,
  ArrowLeft,
  Loader
} from 'lucide-react';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // Form States
  const [form, setForm] = useState({
    quizName: '',
    description: '',
    duration: 60,
    positiveMarking: 2,
    negativeMarking: 0.5,
    tags: '',
    generalAwarenessSyllabus: '',
    reasoningSyllabus: '',
    quantitativeAptitudeSyllabus: '',
    englishSyllabus: '',
    questionsJson: ''
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        const quiz = res.data.data;

        setForm({
          quizName: quiz.quizName,
          description: quiz.description || '',
          duration: quiz.duration,
          positiveMarking: quiz.positiveMarking,
          negativeMarking: quiz.negativeMarking,
          tags: quiz.tags ? quiz.tags.join(', ') : '',
          generalAwarenessSyllabus: quiz.syllabus?.generalAwareness ? quiz.syllabus.generalAwareness.join(', ') : '',
          reasoningSyllabus: quiz.syllabus?.generalIntelligenceReasoning ? quiz.syllabus.generalIntelligenceReasoning.join(', ') : '',
          quantitativeAptitudeSyllabus: quiz.syllabus?.quantitativeAptitude ? quiz.syllabus.quantitativeAptitude.join(', ') : '',
          englishSyllabus: quiz.syllabus?.englishComprehension ? quiz.syllabus.englishComprehension.join(', ') : '',
          questionsJson: JSON.stringify(quiz.questions, null, 2)
        });
      } catch (err) {
        setError('Failed to fetch quiz details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const validateJSONContent = (data) => {
    const errors = [];

    if (!data.quizName || typeof data.quizName !== 'string' || data.quizName.trim() === '') {
      errors.push('Root: "quizName" is required and must be a string.');
    }
    if (data.duration === undefined || typeof data.duration !== 'number' || data.duration <= 0) {
      errors.push('Root: "duration" is required and must be a positive number.');
    }
    if (data.positiveMarking === undefined || typeof data.positiveMarking !== 'number') {
      errors.push('Root: "positiveMarking" is required.');
    }
    if (data.negativeMarking === undefined || typeof data.negativeMarking !== 'number') {
      errors.push('Root: "negativeMarking" is required.');
    }
    if (!data.syllabus || typeof data.syllabus !== 'object') {
      errors.push('Root: "syllabus" object is required.');
    }

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      errors.push('Root: "questions" must be a non-empty array.');
    } else {
      data.questions.forEach((q, idx) => {
        const qNum = q.questionNumber || (idx + 1);
        if (!q.question || typeof q.question !== 'string') {
          errors.push(`Question #${qNum}: "question" (text) is required.`);
        }
        const sections = ['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'];
        if (!q.section || !sections.includes(q.section)) {
          errors.push(`Question #${qNum}: "section" must be one of [${sections.join(', ')}].`);
        }
        if (!q.topic || typeof q.topic !== 'string') {
          errors.push(`Question #${qNum}: "topic" (string) is required.`);
        }
        const difficulties = ['Easy', 'Medium', 'Hard'];
        if (!q.difficulty || !difficulties.includes(q.difficulty)) {
          errors.push(`Question #${qNum}: "difficulty" must be one of [${difficulties.join(', ')}].`);
        }
        if (!q.options || typeof q.options !== 'object' || !q.options.A || !q.options.B || !q.options.C || !q.options.D) {
          errors.push(`Question #${qNum}: "options" must be an object with keys A, B, C, D.`);
        }
        const correctOptions = ['A', 'B', 'C', 'D'];
        if (!q.correctOption || !correctOptions.includes(q.correctOption)) {
          errors.push(`Question #${qNum}: "correctOption" must be A, B, C, or D.`);
        }
      });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setSaveLoading(true);

    const {
      quizName,
      description,
      duration,
      positiveMarking,
      negativeMarking,
      tags,
      generalAwarenessSyllabus,
      reasoningSyllabus,
      quantitativeAptitudeSyllabus,
      englishSyllabus,
      questionsJson
    } = form;

    const parseSyllabusField = (field) => 
      field ? field.split(',').map(item => item.trim()).filter(item => item !== '') : [];

    let questions = [];
    try {
      questions = JSON.parse(questionsJson);
      if (!Array.isArray(questions)) {
        setError('Questions field must be a valid JSON array of question objects.');
        setSaveLoading(false);
        return;
      }
    } catch (err) {
      setError('Questions JSON Syntax Error: Please provide a valid JSON array.');
      setSaveLoading(false);
      return;
    }

    const payload = {
      quizName,
      description,
      duration: Number(duration),
      positiveMarking: Number(positiveMarking),
      negativeMarking: Number(negativeMarking),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      syllabus: {
        generalIntelligenceReasoning: parseSyllabusField(reasoningSyllabus),
        generalAwareness: parseSyllabusField(generalAwarenessSyllabus),
        quantitativeAptitude: parseSyllabusField(quantitativeAptitudeSyllabus),
        englishComprehension: parseSyllabusField(englishSyllabus)
      },
      questions
    };

    const errors = validateJSONContent(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaveLoading(false);
      return;
    }

    try {
      await api.put(`/quizzes/${id}`, payload);
      navigate('/quizzes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/quizzes"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Mock Quiz</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Modify general mock parameters, syllabus items, or questions list and save.
          </p>
        </div>
      </div>

      {/* Main panel */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            <AlertTriangle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 font-sans">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="font-bold">Validation Errors ({validationErrors.length})</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs max-h-40 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Quiz Name
              </label>
              <input
                type="text"
                value={form.quizName}
                onChange={(e) => setForm({ ...form, quizName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Positive Marks
              </label>
              <input
                type="number"
                step="0.1"
                value={form.positiveMarking}
                onChange={(e) => setForm({ ...form, positiveMarking: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Negative Marks
              </label>
              <input
                type="number"
                step="0.05"
                value={form.negativeMarking}
                onChange={(e) => setForm({ ...form, negativeMarking: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Syllabus Segment */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Syllabus (comma separated values)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">General Awareness</label>
                <input
                  type="text"
                  value={form.generalAwarenessSyllabus}
                  onChange={(e) => setForm({ ...form, generalAwarenessSyllabus: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Reasoning</label>
                <input
                  type="text"
                  value={form.reasoningSyllabus}
                  onChange={(e) => setForm({ ...form, reasoningSyllabus: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Quantitative Aptitude</label>
                <input
                  type="text"
                  value={form.quantitativeAptitudeSyllabus}
                  onChange={(e) => setForm({ ...form, quantitativeAptitudeSyllabus: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">English</label>
                <input
                  type="text"
                  value={form.englishSyllabus}
                  onChange={(e) => setForm({ ...form, englishSyllabus: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Questions JSON Text area */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Questions List (Modify JSON Array)
            </label>
            <textarea
              value={form.questionsJson}
              onChange={(e) => setForm({ ...form, questionsJson: e.target.value })}
              rows={10}
              className="w-full font-mono text-xs rounded-xl border border-slate-200 p-3 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saveLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50"
            >
              {saveLoading ? <Loader className="animate-spin" size={16} /> : 'Save Modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
