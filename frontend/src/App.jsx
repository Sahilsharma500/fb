import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CreateQuiz from './pages/CreateQuiz';
import ImportTemplate from './pages/ImportTemplate';
import QuizList from './pages/QuizList';
import EditQuiz from './pages/EditQuiz';
import ExamInterface from './pages/ExamInterface';
import ResultPage from './pages/ResultPage';
import PreviousAttempts from './pages/PreviousAttempts';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';

const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Standalone Fullscreen Exam Simulator */}
      <Route
        path="/exam/:id"
        element={
          <ProtectedRoute>
            <ExamInterface />
          </ProtectedRoute>
        }
      />

      {/* Protected Workspace Layout (includes Sidebar navigation drawer) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
              <Sidebar />
              {/* Content Panel */}
              <main className="flex-1 p-4 md:p-8 md:pl-72 max-w-7xl mx-auto w-full pt-16 md:pt-8 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/create-quiz" element={<ProtectedRoute adminOnly={true}><CreateQuiz /></ProtectedRoute>} />
                  <Route path="/import-template" element={<ProtectedRoute adminOnly={true}><ImportTemplate /></ProtectedRoute>} />
                  <Route path="/quizzes" element={<QuizList />} />
                  <Route path="/edit-quiz/:id" element={<ProtectedRoute adminOnly={true}><EditQuiz /></ProtectedRoute>} />
                  <Route path="/attempts" element={<PreviousAttempts />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/result/:id" element={<ResultPage />} />
                  <Route path="/leaderboard/:id" element={<Leaderboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
