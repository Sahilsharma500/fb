import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import {
  FileSpreadsheet,
  TrendingUp,
  Award,
  BookOpen,
  PlusCircle,
  PlayCircle,
  History,
  BarChart2,
  Calendar,
  ChevronRight,
  Loader,
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/attempts/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

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
    bestScore = 0,
    avgScore = 0,
    recentAttempts = []
  } = stats || {};

  const cards = [
    {
      title: 'Total Quizzes',
      value: totalQuizzes,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Total Attempts',
      value: totalAttempts,
      icon: History,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Best Score',
      value: bestScore,
      icon: Award,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Average Score',
      value: avgScore,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
    },
  ];

  const quickActions = user?.role === 'admin' ? [
    {
      name: 'Admin Panel',
      desc: 'Manage tests & results',
      path: '/admin',
      icon: Shield,
      bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400',
    },
    {
      name: 'Create Quiz',
      desc: 'Form or JSON paste',
      path: '/create-quiz',
      icon: PlusCircle,
      bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    },
    {
      name: 'Quiz List',
      desc: 'Check all mock tests',
      path: '/quizzes',
      icon: PlayCircle,
      bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
    {
      name: 'Analytics',
      desc: 'Subject strength',
      path: '/analytics',
      icon: BarChart2,
      bg: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
    },
  ] : [
    {
      name: 'Attempt Quiz',
      desc: 'Start mock tests',
      path: '/quizzes',
      icon: PlayCircle,
      bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
    {
      name: 'Previous Attempts',
      desc: 'Review answers',
      path: '/attempts',
      icon: History,
      bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
    },
    {
      name: 'Analytics',
      desc: 'Subject strength',
      path: '/analytics',
      icon: BarChart2,
      bg: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-bold md:text-3xl">Welcome back, {user?.name}!</h2>
          <p className="mt-2 text-brand-100 text-sm md:text-base">
            Keep practicing to crack the SSC CGL Exam. Add mock tests, practice your sections, and analyze your performance trends!
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              {user?.role === 'admin' ? 'View Quizzes' : 'Start Practice'}
              <ChevronRight size={16} />
            </Link>
            {user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500/30 px-4 py-2.5 text-sm font-semibold hover:bg-brand-500/50 active:scale-[0.98] border border-white/20 transition-all"
              >
                Admin Panel
              </Link>
            ) : (
              <Link
                to="/quizzes"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500/30 px-4 py-2.5 text-sm font-semibold hover:bg-brand-500/50 active:scale-[0.98] border border-white/20 transition-all"
              >
                View Quizzes
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
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
              <span className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts (2/3 width on large screens) */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Mock Attempts</h3>
            <Link
              to="/attempts"
              className="text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
            >
              See all
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History size={40} className="stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-sm font-medium">No attempts recorded yet</p>
              <Link to="/quizzes" className="text-xs text-brand-500 mt-1 hover:underline">
                Attempt a quiz to get started
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-all"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{attempt.quizName}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <Calendar size={12} />
                      {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {attempt.score} <span className="text-xs font-normal text-slate-400">marks</span>
                      </p>
                      <p className="text-xs text-brand-500 dark:text-brand-400 font-semibold">{attempt.accuracy}% Acc</p>
                    </div>
                    <button
                      onClick={() => navigate(`/result/${attempt._id}`)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group"
              >
                <div className={`rounded-xl p-2.5 ${action.bg}`}>
                  <action.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    {action.name}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
