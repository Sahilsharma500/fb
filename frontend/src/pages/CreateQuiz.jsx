import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  FileText,
  Upload,
  Code,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader
} from 'lucide-react';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('json'); // 'json' or 'manual'
  
  // JSON Import States
  const [jsonText, setJsonText] = useState('');
  const [fileError, setFileError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Manual Form States
  const [manualForm, setManualForm] = useState({
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

  const handleFileUpload = (e) => {
    setFileError('');
    setValidationErrors([]);
    setIsValidated(false);
    
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setFileError('Invalid file format. Please upload a .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Format JSON text nicely
        const parsed = JSON.parse(text);
        setJsonText(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setFileError('Failed to parse file: Invalid JSON syntax.');
      }
    };
    reader.readAsText(file);
  };

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
    } else {
      const validSyllables = ['generalIntelligenceReasoning', 'generalAwareness', 'quantitativeAptitude', 'englishComprehension'];
      validSyllables.forEach(key => {
        if (data.syllabus[key] && !Array.isArray(data.syllabus[key])) {
          errors.push(`Syllabus: "${key}" must be an array of strings.`);
        }
      });
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

  const handleValidate = () => {
    setFileError('');
    setValidationErrors([]);
    setIsValidated(false);

    if (!jsonText.trim()) {
      setFileError('Please paste JSON content or upload a JSON file.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const errors = validateJSONContent(parsed);
      setValidationErrors(errors);
      setIsValidated(true);
      return errors.length === 0 ? parsed : null;
    } catch (err) {
      setFileError('Syntax Error: Invalid JSON format. Check for missing brackets or commas.');
      return null;
    }
  };

  const handleImportSubmit = async () => {
    const parsedData = handleValidate();
    if (!parsedData) return;

    setLoading(true);
    try {
      await api.post('/quizzes/import', parsedData);
      navigate('/quizzes');
    } catch (err) {
      setFileError(err.response?.data?.message || 'Import failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Manual Form Submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setFileError('');
    setValidationErrors([]);

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
    } = manualForm;

    // Parse syllabus fields (comma separated)
    const parseSyllabusField = (field) => 
      field ? field.split(',').map(item => item.trim()).filter(item => item !== '') : [];

    // Parse questions JSON
    let questions = [];
    if (questionsJson.trim()) {
      try {
        questions = JSON.parse(questionsJson);
        if (!Array.isArray(questions)) {
          setFileError('Questions field must be a valid JSON array of question objects.');
          return;
        }
      } catch (err) {
        setFileError('Questions JSON Syntax Error: Please provide a valid JSON array.');
        return;
      }
    } else {
      setFileError('Please provide questions in JSON array format in the questions box.');
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

    // Validate using utility
    const errors = validateJSONContent(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/quizzes', payload);
      navigate('/quizzes');
    } catch (err) {
      setFileError(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Mock Quiz</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create or import a custom CGL mock test using manually constructed parameters or direct JSON.
          </p>
        </div>
        <Link
          to="/import-template"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <Info size={14} />
          View JSON Template
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 p-1 w-fit">
        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'json'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Code size={16} />
          Import JSON File
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'manual'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText size={16} />
          Create Manually (Form)
        </button>
      </div>

      {/* Main panel */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
        
        {/* Alerts / Error messages */}
        {fileError && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            <AlertTriangle size={18} className="shrink-0" />
            <p>{fileError}</p>
          </div>
        )}

        {isValidated && validationErrors.length === 0 && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-4 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>JSON Validation Successful! All fields conform to CGL CBT specifications.</p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="font-bold">JSON Validation Errors ({validationErrors.length})</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs max-h-40 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab content: JSON Import */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload JSON File
                </label>
                <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors group cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Select or drop mock file (.json)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 self-stretch flex flex-col justify-center">
                <p className="font-bold mb-1 text-slate-600 dark:text-slate-400">💡 Quick Info</p>
                <p>Importing automatically parses and populates the quiz structure, syllabus targets, and CBT navigation palette configurations.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste JSON Text
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste CGL questions JSON payload here..."
                rows={12}
                className="w-full font-mono text-xs rounded-2xl border border-slate-200 bg-slate-50/50 p-4 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:focus:bg-slate-950 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleValidate}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Validate JSON
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : 'Parse & Save Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Tab content: Manual Setup */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quiz Name
                </label>
                <input
                  type="text"
                  value={manualForm.quizName}
                  onChange={(e) => setManualForm({ ...manualForm, quizName: e.target.value })}
                  placeholder="e.g. Quant Algebra Revision"
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
                  value={manualForm.tags}
                  onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                  placeholder="e.g. Algebra, Tier 1, Mock"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                placeholder="Provide details about the test..."
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
                  value={manualForm.duration}
                  onChange={(e) => setManualForm({ ...manualForm, duration: Number(e.target.value) })}
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
                  value={manualForm.positiveMarking}
                  onChange={(e) => setManualForm({ ...manualForm, positiveMarking: Number(e.target.value) })}
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
                  value={manualForm.negativeMarking}
                  onChange={(e) => setManualForm({ ...manualForm, negativeMarking: Number(e.target.value) })}
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
                    value={manualForm.generalAwarenessSyllabus}
                    onChange={(e) => setManualForm({ ...manualForm, generalAwarenessSyllabus: e.target.value })}
                    placeholder="e.g. Buddhism, Mauryan Empire"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Reasoning</label>
                  <input
                    type="text"
                    value={manualForm.reasoningSyllabus}
                    onChange={(e) => setManualForm({ ...manualForm, reasoningSyllabus: e.target.value })}
                    placeholder="e.g. Syllogism, Coding-Decoding"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Quantitative Aptitude</label>
                  <input
                    type="text"
                    value={manualForm.quantitativeAptitudeSyllabus}
                    onChange={(e) => setManualForm({ ...manualForm, quantitativeAptitudeSyllabus: e.target.value })}
                    placeholder="e.g. Number System, Percentage"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">English</label>
                  <input
                    type="text"
                    value={manualForm.englishSyllabus}
                    onChange={(e) => setManualForm({ ...manualForm, englishSyllabus: e.target.value })}
                    placeholder="e.g. Noun, Pronoun"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Questions JSON Text area */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Questions List (Paste JSON Array)
              </label>
              <textarea
                value={manualForm.questionsJson}
                onChange={(e) => setManualForm({ ...manualForm, questionsJson: e.target.value })}
                placeholder='[{"questionNumber":1, "section":"General Awareness", "topic":"Buddhism", "difficulty":"Medium", "question":"Where did Buddha attain enlightenment?", "options":{"A":"Sarnath","B":"Bodh Gaya","C":"Kushinagar","D":"Lumbini"}, "correctOption":"B", "explanation":"Buddha attained enlightenment under a pipal tree in Bodh Gaya."}]'
                rows={6}
                className="w-full font-mono text-xs rounded-xl border border-slate-200 p-3 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : 'Save New Quiz'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
