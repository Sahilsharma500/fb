import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  History,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Loader
} from 'lucide-react';

const PreviousAttempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get('/attempts');
        setAttempts(res.data.data);
      } catch (err) {
        console.error('Error fetching attempts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  // Format time taken
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Previous Attempts Log</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review details of all your past mock test attempts, scores, and questions.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl text-slate-400">
          <History size={48} className="stroke-[1.5] mb-2 text-slate-300" />
          <p className="text-sm font-medium">No attempts logged yet</p>
          <Link
            to="/quizzes"
            className="text-xs text-brand-500 mt-1.5 font-bold hover:underline"
          >
            Attempt a quiz now
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Quiz Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Correct/Total</th>
                  <th className="py-3 px-4 text-center">Time Spent</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {attempt.quizName}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-400">
                      <span className="text-emerald-600 font-bold">{attempt.correctAnswers}</span>
                      <span className="text-slate-400"> / {attempt.totalQuestions}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={12} />
                        {formatTime(attempt.timeTaken)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                        {attempt.accuracy}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {attempt.score} marks
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/result/${attempt._id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Solutions
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousAttempts;
