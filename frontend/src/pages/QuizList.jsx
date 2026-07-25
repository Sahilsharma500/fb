import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import {
  Search,
  BookOpen,
  Calendar,
  Layers,
  History,
  Award,
  Play,
  Copy,
  Trash2,
  Edit,
  Loader,
  AlertCircle
} from 'lucide-react';

const QuizList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data.data);
    } catch (err) {
      console.error('Error fetching quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All associated attempt histories will be permanently removed.')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/quizzes/${id}/duplicate`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Duplicate failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.quizName.toLowerCase().includes(search.toLowerCase()) ||
                          q.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = tagFilter === '' || q.tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  });

  // Extract all unique tags across all quizzes
  const allTags = Array.from(
    new Set(quizzes.reduce((acc, q) => [...acc, ...q.tags], []))
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mock Quizzes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.role === 'admin' 
              ? 'Select an exam to simulate, edit questions, duplicate templates, or delete old records.'
              : 'Select an exam to simulate and view its leaderboard standings.'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/create-quiz')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all shrink-0"
          >
            Add New Quiz
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by name or description..."
            className="w-full rounded-2xl border border-slate-200/60 bg-white pl-11 pr-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded-2xl border border-slate-200/60 bg-white px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:border-brand-500 min-w-[150px]"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {actionLoading && (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 p-2 rounded-xl">
          <Loader className="animate-spin" size={14} />
          Processing request...
        </div>
      )}

      {/* Grid of Quizzes */}
      {filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl text-slate-400">
          <BookOpen size={44} className="stroke-[1.5] mb-2 text-slate-300" />
          <p className="text-sm font-medium">No quizzes found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or upload a quiz JSON.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quiz) => {
            const syllabusItems = [];
            if (quiz.syllabus?.generalAwareness?.length) syllabusItems.push(`GA (${quiz.syllabus.generalAwareness.length})`);
            if (quiz.syllabus?.reasoning?.length) syllabusItems.push(`Reasoning (${quiz.syllabus.reasoning.length})`);
            if (quiz.syllabus?.quantitativeAptitude?.length) syllabusItems.push(`Quant (${quiz.syllabus.quantitativeAptitude.length})`);
            if (quiz.syllabus?.english?.length) syllabusItems.push(`English (${quiz.syllabus.english.length})`);

            return (
              <div
                key={quiz._id}
                className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  {/* Name and Tags */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 line-clamp-1">{quiz.quizName}</h3>
                    {quiz.attemptsCount > 0 && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                        Attempted
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {quiz.description || 'No description provided.'}
                  </p>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/50 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-slate-400" />
                      <span>{quiz.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{quiz.duration} min duration</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <History size={14} className="text-slate-400" />
                      <span>{quiz.attemptsCount} Attempts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-slate-400" />
                      <span>Best: {quiz.highestScore !== null ? `${quiz.highestScore} marks` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Syllabus Covered */}
                  {syllabusItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                        Syllabus Preview
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {syllabusItems.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-2xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                  <div className="flex gap-2">
                    {user?.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                          title="Edit Quiz"
                          className="rounded-xl border border-slate-100 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(quiz._id)}
                          title="Duplicate Template"
                          className="rounded-xl border border-slate-100 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          title="Delete Quiz"
                          className="rounded-xl border border-slate-100 p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/leaderboard/${quiz._id}`)}
                          title="Leaderboard"
                          className="rounded-xl border border-slate-100 p-2.5 text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:border-slate-800 dark:text-amber-400 dark:hover:bg-slate-800 dark:hover:text-amber-300 transition-colors"
                        >
                          <Award size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/leaderboard/${quiz._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
                      >
                        <Award size={14} className="text-amber-500" />
                        Leaderboard
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/exam/${quiz._id}`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 active:scale-[0.98] transition-all"
                  >
                    <Play size={12} fill="white" />
                    Start Simulator
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizList;
