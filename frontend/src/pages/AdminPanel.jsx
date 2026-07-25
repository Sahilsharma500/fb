import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ShieldAlert,
  Loader,
  PlusCircle,
  FileJson,
  BookOpen,
  History,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Play,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/attempts/admin/stats');
      setStats(statsRes.data.data);

      const quizRes = await api.get('/quizzes');
      // For admin, we show all quizzes
      setQuizzes(quizRes.data.data);
    } catch (err) {
      console.error('Error fetching admin workspace data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All candidate attempt records will be deleted permanently.')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/quizzes/${id}`);
      await fetchAdminData();
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
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Duplicate failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  const {
    totalQuizzes = 0,
    totalAttempts = 0,
    avgScore = 0,
    totalCandidates = 0,
    recentAttempts = []
  } = stats || {};

  const statCards = [
    {
      title: 'Quizzes Managed',
      value: totalQuizzes,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Attempts',
      value: totalAttempts,
      icon: History,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Average Score',
      value: `${avgScore} marks`,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Active Candidates',
      value: totalCandidates,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500/20 text-brand-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              System Admin
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Console</h2>
          <p className="text-sm text-slate-400">
            Create mock tests, monitor candidate attempts, duplicate template structures, and view live leaderboards.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/import-template')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all"
          >
            <FileJson size={16} />
            Import JSON
          </button>
          <button
            onClick={() => navigate('/create-quiz')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle size={16} />
            Create Quiz
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className={`rounded-xl bg-gradient-to-tr ${card.color} p-2.5 text-white shadow-sm`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {actionLoading && (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 p-2 rounded-xl">
          <Loader className="animate-spin" size={14} />
          Processing request...
        </div>
      )}

      {/* Main Grid: Quiz List & Recent attempts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quizzes List (2/3 width) */}
        <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Mock Quizzes</h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full">
              {quizzes.length} Quizzes
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookOpen size={44} className="stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-sm font-medium">No quizzes created yet</p>
              <button
                onClick={() => navigate('/create-quiz')}
                className="text-xs text-brand-500 mt-2 font-semibold hover:underline"
              >
                Create your first quiz now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-2">Quiz Details</th>
                    <th className="py-3 px-2">Params</th>
                    <th className="py-3 px-2">Attempts</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-4 px-2">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{quiz.quizName}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{quiz.description || 'No description'}</div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {quiz.questionCount} Questions
                        </div>
                        <div className="text-xs text-slate-400">
                          {quiz.duration} mins
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{quiz.attemptsCount}</span>
                          {quiz.attemptsCount > 0 && (
                            <Link
                              to={`/leaderboard/${quiz._id}`}
                              className="text-brand-500 hover:text-brand-600 inline-flex items-center"
                              title="View Leaderboard"
                            >
                              <ExternalLink size={12} className="ml-0.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                            title="Edit Quiz"
                            className="rounded-lg border border-slate-100 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(quiz._id)}
                            title="Duplicate Template"
                            className="rounded-lg border border-slate-100 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(quiz._id)}
                            title="Delete Quiz"
                            className="rounded-lg border border-slate-100 p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Attempts list (1/3 width) */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent System Attempts</h3>

          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <History size={40} className="stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-sm font-medium">No attempts recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {attempt.userName}
                      </h4>
                      <p className="text-2xs text-slate-400 truncate">{attempt.userEmail}</p>
                    </div>
                    <span className="shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-2xs font-semibold px-2 py-0.5 rounded-lg">
                      {attempt.score} marks
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-2xs text-slate-400 border-t border-slate-100/60 dark:border-slate-800/50 pt-2">
                    <span className="font-medium truncate max-w-[120px]">{attempt.quizName}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar size={10} />
                      {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
