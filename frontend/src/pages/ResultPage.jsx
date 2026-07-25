import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Loader
} from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionFilter, setActiveSectionFilter] = useState('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All'); // 'All', 'Correct', 'Wrong', 'Skipped'
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${id}`);
        setResult(res.data.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load attempt result details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate]);

  const toggleExplanation = (qNum) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  if (loading || !result) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  // Format time taken
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) {
      return `${m} min ${s} sec`;
    }
    return `${s} sec`;
  };

  const {
    quizName,
    score,
    accuracy,
    timeTaken,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    sectionPerformance = [],
    answers = []
  } = result;

  // Filter logic for questions list
  const filteredAnswers = answers.filter(ans => {
    const matchSec = activeSectionFilter === 'All' || ans.section === activeSectionFilter;
    let matchStat = true;
    if (activeStatusFilter === 'Correct') matchStat = ans.isCorrect && ans.selectedOption;
    else if (activeStatusFilter === 'Wrong') matchStat = !ans.isCorrect && ans.selectedOption;
    else if (activeStatusFilter === 'Skipped') matchStat = !ans.selectedOption;

    return matchSec && matchStat;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-extrabold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/20 px-2.5 py-1 rounded-lg">
            Exam Submission Review
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{quizName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Attempt completed on {new Date(result.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <Link
            to={`/exam/${result.quiz}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            <RotateCcw size={14} />
            Re-Attempt
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Final Score</span>
            <Award className="text-brand-500" size={20} />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">marks</span>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Accuracy</span>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{accuracy}%</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">overall</span>
          </div>
        </div>

        {/* Time Spent Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Time Taken</span>
            <Clock className="text-amber-500" size={20} />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatTime(timeTaken)}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">Answers Breakdown</span>
          <div className="grid grid-cols-3 text-center gap-1">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{correctAnswers}</p>
              <p className="text-3xs text-slate-400 mt-0.5">Correct</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-xl border border-red-100/50 dark:border-red-900/10">
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">{wrongAnswers}</p>
              <p className="text-3xs text-slate-400 mt-0.5">Wrong</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">{skippedAnswers}</p>
              <p className="text-3xs text-slate-400 mt-0.5">Skipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section-wise performance table */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 overflow-hidden">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Sectional Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Correct</th>
                <th className="py-3 px-4 text-center">Wrong</th>
                <th className="py-3 px-4 text-center">Skipped</th>
                <th className="py-3 px-4 text-right">Section Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {sectionPerformance.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{sec.sectionName}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400">{sec.correct}</td>
                  <td className="py-3.5 px-4 text-center text-red-500">{sec.wrong}</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">{sec.skipped}</td>
                  <td className="py-3.5 px-4 text-right text-slate-800 dark:text-slate-200 font-bold">{sec.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question review container */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Question Paper Analysis</h3>
          
          {/* Review filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={activeSectionFilter}
              onChange={(e) => setActiveSectionFilter(e.target.value)}
              className="rounded-xl border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 outline-none"
            >
              <option value="All">All Sections</option>
              <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
              <option value="General Awareness">General Awareness</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="English Comprehension">English Comprehension</option>
            </select>

            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Correct">Correct Only</option>
              <option value="Wrong">Wrong Only</option>
              <option value="Skipped">Skipped Only</option>
            </select>
          </div>
        </div>

        {/* Questions list */}
        {filteredAnswers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No questions match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnswers.map((ans) => {
              const isExpanded = expandedQuestions[ans.questionNumber];
              const isSkipped = !ans.selectedOption;
              const isCorrect = ans.isCorrect && !isSkipped;
              
              let statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-2xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  Correct
                </span>
              );

              if (isSkipped) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-2xs font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                    <HelpCircle size={12} />
                    Skipped
                  </span>
                );
              } else if (!isCorrect) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-2xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    <XCircle size={12} />
                    Wrong
                  </span>
                );
              }

              return (
                <div
                  key={ans.questionNumber}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 space-y-3 transition-colors hover:border-slate-200 dark:hover:border-slate-700/60"
                >
                  {/* Header info */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Q.{ans.questionNumber}
                      </span>
                      <span className="text-slate-400 font-medium">
                        [{ans.section} | {ans.topic}]
                      </span>
                    </div>
                    <div>{statusBadge}</div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {ans.questionText}
                  </p>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {Object.keys(ans.options).map((key) => {
                      const isUserSelected = ans.selectedOption === key;
                      const isCorrectChoice = ans.correctOption === key;
                      
                      let choiceClass = 'border-slate-100 bg-slate-50 text-slate-700 dark:border-slate-800/40 dark:bg-slate-900/40 dark:text-slate-300';
                      if (isCorrectChoice) {
                        choiceClass = 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400';
                      } else if (isUserSelected && !isCorrectChoice) {
                        choiceClass = 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400';
                      }

                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-3 border rounded-xl p-3 font-semibold ${choiceClass}`}
                        >
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-2xs border ${
                            isCorrectChoice
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isUserSelected
                              ? 'bg-red-500 text-white border-red-500'
                              : 'border-slate-300'
                          }`}>
                            {key}
                          </div>
                          <span>{ans.options[key]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Collapsible trigger */}
                  <button
                    onClick={() => toggleExplanation(ans.questionNumber)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors cursor-pointer"
                  >
                    <BookOpen size={14} />
                    <span>{isExpanded ? 'Hide Solution & Explanation' : 'View Solution & Explanation'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="text-xs bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2 mt-2 font-sans">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Correct Option: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{ans.correctOption}</span>
                      </p>
                      {ans.explanation ? (
                        <div className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                          {ans.explanation}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No explanation was compiled for this question.</p>
                      )}
                      {ans.source && (
                        <p className="text-3xs text-slate-400 font-semibold tracking-wide uppercase pt-1 border-t border-slate-100 dark:border-slate-800/50">
                          Source: {ans.source}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
