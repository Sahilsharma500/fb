import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Clock,
  BookOpen,
  Calendar,
  History,
  CheckCircle,
  Loader
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/attempts/dashboard/analytics');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  const {
    scoreTrend = [],
    accuracyBySubject = [],
    strongTopics = [],
    weakTopics = []
  } = data || {};

  // Custom tooltips for graphs
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/90 text-xs font-sans">
          <p className="font-bold text-slate-800 dark:text-slate-200">{dataPoint.quizName || dataPoint.subject}</p>
          <p className="mt-1 font-semibold text-brand-500">
            {payload[0].name}: {payload[0].value}{payload[0].name === 'Accuracy' ? '%' : ' marks'}
          </p>
          {dataPoint.date && <p className="text-3xs text-slate-400 mt-1">Date: {dataPoint.date}</p>}
        </div>
      );
    }
    return null;
  };

  // Recharts Subject Colors
  const SUBJECT_COLORS = {
    'General Intelligence & Reasoning': '#a855f7', // purple
    'General Awareness': '#3b82f6', // blue
    'Quantitative Aptitude': '#f97316', // orange
    'English Comprehension': '#22c55e' // green
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track score progress, subject competencies, topic accuracy, and targeted weak items.
        </p>
      </div>

      {scoreTrend.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl text-slate-400">
          <History size={48} className="stroke-[1.5] mb-2 text-slate-300" />
          <p className="text-sm font-medium">No attempts recorded yet</p>
          <p className="text-xs text-slate-500 mt-1">Complete a quiz simulator session to activate analytics.</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score progress line chart */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-4">Score Progression Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="attemptNumber" stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Accuracy Bar Chart */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-4">Subject-wise Accuracy</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyBySubject} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontStyle="bold" tickFormatter={(v) => v.split(' ')[0]} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="accuracy" name="Accuracy" radius={[8, 8, 0, 0]}>
                      {accuracyBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[entry.subject] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strong Topics (accuracy >= 75%) */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Strongest Topics (Accuracy ≥ 75%)</h3>
              </div>

              {strongTopics.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No topics classified under strengths yet.</p>
              ) : (
                <div className="space-y-3">
                  {strongTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{topic.topic}</p>
                        <p className="text-3xs text-slate-400 mt-0.5 uppercase tracking-wider">{topic.section}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{topic.accuracy}%</p>
                        <p className="text-3xs text-slate-400">{topic.correct}/{topic.attempted} Ans</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Topics (accuracy < 50%) */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Weakest Topics (Accuracy &lt; 50%)</h3>
              </div>

              {weakTopics.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No topics classified under weakness yet.</p>
              ) : (
                <div className="space-y-3">
                  {weakTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-red-50/20 dark:bg-red-950/5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{topic.topic}</p>
                        <p className="text-3xs text-slate-400 mt-0.5 uppercase tracking-wider">{topic.section}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-red-500">{topic.accuracy}%</p>
                        <p className="text-3xs text-slate-400">{topic.correct}/{topic.attempted} Ans</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
