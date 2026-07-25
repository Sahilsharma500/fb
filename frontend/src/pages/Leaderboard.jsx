import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Award,
  Loader,
  ArrowLeft,
  Search,
  Clock,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

const Leaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const quizRes = await api.get(`/quizzes/${id}`);
        setQuiz(quizRes.data.data);

        const leaderboardRes = await api.get(`/quizzes/${id}/leaderboard`);
        setLeaderboard(leaderboardRes.data.data);
      } catch (err) {
        console.error('Error fetching leaderboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [id]);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredLeaderboard = leaderboard.filter((item) =>
    item.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  // Get podium ranks (Top 3)
  const top1 = filteredLeaderboard[0] || null;
  const top2 = filteredLeaderboard[1] || null;
  const top3 = filteredLeaderboard[2] || null;
  const remainingCandidates = filteredLeaderboard.slice(3);

  // Maximum marks possible
  const maxMarks = quiz ? quiz.questions.length * quiz.positiveMarking : 0;

  return (
    <div className="space-y-8">
      {/* Back & Title */}
      <div className="flex flex-col gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Quizzes
          </button>
        </div>
        
        {quiz && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Trophy size={12} fill="currentColor" />
                  Quiz Leaderboard
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{quiz.quizName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
            </div>
            
            <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 md:border-t-0 pt-4 md:pt-0">
              <div className="text-center bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-900/60 min-w-[90px]">
                <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{quiz.questions.length}</p>
              </div>
              <div className="text-center bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-900/60 min-w-[90px]">
                <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{quiz.duration}m</p>
              </div>
              <div className="text-center bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-900/60 min-w-[90px]">
                <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Max Marks</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{maxMarks}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl text-slate-400 shadow-sm">
          <Award size={48} className="stroke-[1.2] mb-3 text-slate-300" />
          <p className="text-sm font-semibold">Leaderboard is empty</p>
          <p className="text-xs text-slate-500 mt-1">Be the first to attempt this quiz and claim the top rank!</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 (Only visible if searching is empty or they exist) */}
          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6 px-4">
              
              {/* 2nd Place (Left) */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                {top2 ? (
                  <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 shadow-md p-6 flex flex-col items-center text-center space-y-3 relative hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 bg-slate-200 text-slate-800 font-extrabold text-sm h-10 w-10 flex items-center justify-center rounded-2xl border-2 border-white dark:border-slate-900 shadow-md">
                      2
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-400 shadow-inner">
                      {top2.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{top2.userName}</h4>
                      <p className="text-2xs text-slate-400 truncate w-32">{top2.userEmail}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 w-full py-2 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{top2.score} marks</p>
                      <p className="text-3xs text-slate-400 mt-0.5">{top2.accuracy}% Acc | {formatTime(top2.timeTaken)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-36 bg-slate-100/30 border border-dashed border-slate-200 dark:bg-slate-950/10 dark:border-slate-800 rounded-3xl flex items-center justify-center text-xs text-slate-400">
                    Empty Rank
                  </div>
                )}
              </div>

              {/* 1st Place (Middle, taller) */}
              <div className="order-1 md:order-2 flex flex-col items-center">
                {top1 ? (
                  <div className="w-full bg-gradient-to-b from-brand-50 to-white dark:from-brand-950/30 dark:to-slate-900 rounded-3xl border-2 border-brand-500/20 dark:border-brand-500/10 shadow-lg p-8 flex flex-col items-center text-center space-y-4 relative md:-translate-y-4 hover:-translate-y-5 transition-all duration-300">
                    <div className="absolute -top-8 bg-amber-500 text-white font-extrabold text-lg h-12 w-12 flex items-center justify-center rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg animate-bounce">
                      👑
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-extrabold text-xl text-white shadow-md relative">
                      <Sparkles className="absolute -top-1 -right-1 text-white animate-pulse" size={14} />
                      {top1.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">{top1.userName}</h4>
                      <p className="text-2xs text-slate-400 truncate w-40">{top1.userEmail}</p>
                    </div>
                    <div className="bg-brand-500/10 dark:bg-brand-500/5 w-full py-2.5 rounded-2xl border border-brand-500/20 dark:border-brand-500/10">
                      <p className="text-sm font-extrabold text-brand-600 dark:text-brand-400">{top1.score} marks</p>
                      <p className="text-3xs text-brand-500 dark:text-brand-300 font-semibold mt-0.5">
                        {top1.accuracy}% Acc | {formatTime(top1.timeTaken)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-slate-100/30 border border-dashed border-slate-200 dark:bg-slate-950/10 dark:border-slate-800 rounded-3xl flex items-center justify-center text-xs text-slate-400">
                    Empty Rank
                  </div>
                )}
              </div>

              {/* 3rd Place (Right) */}
              <div className="order-3 flex flex-col items-center">
                {top3 ? (
                  <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 shadow-md p-6 flex flex-col items-center text-center space-y-3 relative hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 bg-amber-700 text-white font-extrabold text-sm h-10 w-10 flex items-center justify-center rounded-2xl border-2 border-white dark:border-slate-900 shadow-md">
                      3
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-amber-800 dark:text-amber-600 shadow-inner">
                      {top3.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{top3.userName}</h4>
                      <p className="text-2xs text-slate-400 truncate w-32">{top3.userEmail}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 w-full py-2 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{top3.score} marks</p>
                      <p className="text-3xs text-slate-400 mt-0.5">{top3.accuracy}% Acc | {formatTime(top3.timeTaken)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-36 bg-slate-100/30 border border-dashed border-slate-200 dark:bg-slate-950/10 dark:border-slate-800 rounded-3xl flex items-center justify-center text-xs text-slate-400">
                    Empty Rank
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Search bar & Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h3 className="font-bold text-slate-900 dark:text-white">All Candidate Standings</h3>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name..."
                  className="w-full rounded-2xl border border-slate-200/60 bg-white pl-10 pr-4 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>

            {filteredLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No matching candidates found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Score</th>
                      <th className="py-3 px-3">Accuracy</th>
                      <th className="py-3 px-3">Time Taken</th>
                      <th className="py-3 px-3 text-right">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {filteredLeaderboard.map((item, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={item.attemptId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-3">
                            <span
                              className={`h-6 w-6 inline-flex items-center justify-center rounded-lg font-bold text-xs ${
                                rank === 1
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : rank === 2
                                  ? 'bg-slate-200 text-slate-800'
                                  : rank === 3
                                  ? 'bg-amber-700/10 text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{item.userName}</div>
                            <div className="text-2xs text-slate-400">{item.userEmail}</div>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.score} <span className="text-slate-400 text-xs font-normal">/ {maxMarks}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.accuracy}%</span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${item.accuracy}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            {formatTime(item.timeTaken)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
