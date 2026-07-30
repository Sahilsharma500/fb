import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Clock,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle,
  Loader,
  Play,
  Coffee,
  Accessibility
} from 'lucide-react';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ExamInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Settings & Navigation States
  const [examStarted, setExamStarted] = useState(false);
  const [isScribe, setIsScribe] = useState(false);
  
  // Section control states
  const [activeSectionName, setActiveSectionName] = useState(null); // String or null (null = break/selection state)
  const [completedSections, setCompletedSections] = useState([]); // Array of section names completed
  const [activeIdx, setActiveIdx] = useState(0); // overall questions array index
  const [userAnswers, setUserAnswers] = useState([]); // Array matching quiz questions
  
  // Timers
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0); // active section timer (seconds)
  const [breakTimeLeft, setBreakTimeLeft] = useState(0); // 5-minute break timer (seconds)
  const [sectionElapsed, setSectionElapsed] = useState({
    'General Intelligence & Reasoning': 0,
    'General Awareness': 0,
    'Quantitative Aptitude': 0,
    'English Comprehension': 0
  });

  const [selectedOption, setSelectedOption] = useState(null);
  
  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSectionSubmitModal, setShowSectionSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const breakTimerRef = useRef(null);

  const sectionsList = [
    'General Intelligence & Reasoning',
    'General Awareness',
    'Quantitative Aptitude',
    'English Comprehension'
  ];

  // Load Quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        const data = res.data.data;
        setQuiz(data);

        // Initialize user answers array
        const initialAnswers = data.questions.map(q => ({
          questionNumber: q.questionNumber,
          section: q.section,
          topic: q.topic,
          selectedOption: null,
          status: 'not-visited' // 'not-visited', 'visited' (not-answered), 'answered', 'marked', 'answered-marked'
        }));
        
        setUserAnswers(initialAnswers);
      } catch (err) {
        console.error(err);
        alert('Failed to load quiz');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  // Section Duration (seconds)
  const getSectionDuration = () => {
    return (isScribe ? 20 : 15) * 60;
  };

  // Start Exam trigger
  const handleStartExam = (scribeMode) => {
    setIsScribe(scribeMode);
    setExamStarted(true);
    // Keep activeSectionName as null initially to force selection of the first section
  };

  // Start a specific section
  const handleStartSection = (sectionName) => {
    if (completedSections.includes(sectionName)) return;

    setActiveSectionName(sectionName);
    setSectionTimeLeft(getSectionDuration());
    
    // Reset break timer
    setBreakTimeLeft(0);
    clearInterval(breakTimerRef.current);

    // Set first question of this section as active question
    if (quiz && quiz.questions.length > 0) {
      const firstQIdx = quiz.questions.findIndex(q => q.section === sectionName);
      if (firstQIdx !== -1) {
        setActiveIdx(firstQIdx);
        setUserAnswers(prev => {
          const updated = [...prev];
          if (updated[firstQIdx] && updated[firstQIdx].status === 'not-visited') {
            updated[firstQIdx].status = 'visited';
          }
          return updated;
        });
      }
    }
  };

  // Active Section Timer Loop
  useEffect(() => {
    if (examStarted && activeSectionName && sectionTimeLeft > 0 && !loading && !submitting) {
      timerRef.current = setInterval(() => {
        // Increment active section elapsed time
        setSectionElapsed(prev => ({
          ...prev,
          [activeSectionName]: prev[activeSectionName] + 1
        }));

        setSectionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSectionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examStarted, activeSectionName, sectionTimeLeft, loading, submitting]);

  // Break Timer Loop (5 minutes max)
  useEffect(() => {
    if (examStarted && !activeSectionName && breakTimeLeft > 0 && completedSections.length < 4 && !submitting) {
      breakTimerRef.current = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(breakTimerRef.current);
            handleBreakTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breakTimerRef.current);
  }, [examStarted, activeSectionName, breakTimeLeft, completedSections, submitting]);

  // Sync selectedOption when activeIdx changes
  useEffect(() => {
    if (examStarted && activeSectionName && userAnswers.length > 0) {
      setSelectedOption(userAnswers[activeIdx]?.selectedOption || null);
      
      // Update state to visited if not visited
      if (userAnswers[activeIdx].status === 'not-visited') {
        setUserAnswers(prev => {
          const updated = [...prev];
          updated[activeIdx].status = 'visited';
          return updated;
        });
      }
    }
  }, [activeIdx, userAnswers, examStarted, activeSectionName]);

  if (loading || !quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <Loader className="animate-spin text-brand-400 mx-auto" size={36} />
          <p className="text-sm font-semibold">Configuring CBT Console...</p>
        </div>
      </div>
    );
  }

  // 1. Pre-exam profile choice screen
  if (!examStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
              <Accessibility size={28} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CGL CBT Examination Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select your profile category to configure exam timers</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-6 text-xs text-slate-600 dark:text-slate-400 space-y-3">
            <h3 className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">⏳ Timing & Sectional Rules</h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed font-medium">
              <li><strong>Pick Any Section</strong>: You can start with any section of your choice.</li>
              <li><strong>Sectional Timer</strong>: Once you start a section, you must finish it (15 mins Regular / 20 mins Scribe) before you can start another. You cannot go back to submitted sections.</li>
              <li><strong>5-Minute Break</strong>: There is a maximum break of 5 minutes between sections. You can skip the break early by starting your next section of choice.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleStartExam(false)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/20 hover:scale-[1.01] transition-all text-center space-y-2 group"
            >
              <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500">Regular Candidate</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">15 minutes per section</p>
              <span className="text-2xs font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-700">
                Total: 60 mins (Excl. Breaks)
              </span>
            </button>

            <button
              onClick={() => handleStartExam(true)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/20 hover:scale-[1.01] transition-all text-center space-y-2 group"
            >
              <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500">Scribe Candidate</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">20 minutes per section (PwD)</p>
              <span className="text-2xs font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-700">
                Total: 80 mins (Excl. Breaks)
              </span>
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <span className="text-xs text-slate-400">Quiz: {quiz.quizName}</span>
            <button
              onClick={() => navigate('/quizzes')}
              className="text-xs font-semibold text-slate-500 hover:underline"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Section selection / Break state screen
  if (examStarted && !activeSectionName) {
    const uncompleted = sectionsList.filter(name => !completedSections.includes(name));
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
          <div className="text-center mb-6">
            {completedSections.length > 0 ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                  <Coffee size={28} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transition Break</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Section completed. Take a break or select your next subject.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400 font-mono font-bold text-sm">
                  <span>Break Time Left: {formatTime(breakTimeLeft)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
                  <Play size={28} fill="white" className="ml-1" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Begin Mock Test</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select whichever subject you want to attempt first</p>
              </>
            )}
          </div>

          {/* Section selections */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Subject Selection</h3>
            <div className="grid grid-cols-1 gap-3">
              {sectionsList.map((secName) => {
                const isDone = completedSections.includes(secName);
                const questionCount = quiz.questions.filter(q => q.section === secName).length;
                if (questionCount === 0) return null;

                return (
                  <div
                    key={secName}
                    className={`flex items-center justify-between border rounded-2xl p-4 transition-all ${
                      isDone
                        ? 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-800'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-brand-500 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <h4 className={`font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {secName}
                      </h4>
                      <p className="text-2xs text-slate-400">{questionCount} questions • {isScribe ? 20 : 15} minutes</p>
                    </div>

                    {isDone ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-xl">
                        ✓ Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartSection(secName)}
                        className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
                      >
                        <Play size={12} fill="white" />
                        Start Section
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <span className="text-xs text-slate-400">Total subjects completed: {completedSections.length} of 4</span>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end the exam early? All uncompleted sections will be skipped.')) {
                  handleSubmitQuiz();
                }
              }}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Submit Entire Exam Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Break Timeout Auto-selection
  const handleBreakTimeout = () => {
    const uncompleted = sectionsList.filter(name => !completedSections.includes(name));
    if (uncompleted.length > 0) {
      alert(`Break time expired! System is automatically starting: ${uncompleted[0]}`);
      handleStartSection(uncompleted[0]);
    }
  };

  const questions = quiz.questions;
  const currentQ = questions[activeIdx];

  // Active section questions list
  const sectionQuestions = questions.filter(q => q.section === activeSectionName);
  const currentQIndexInSection = sectionQuestions.findIndex(q => q.questionNumber === currentQ.questionNumber);

  // Helper to format remaining time
  const formatSectionTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Section transition early submission
  const submitActiveSection = () => {
    setUserAnswers(prev => {
      const updated = [...prev];
      if (selectedOption) {
        updated[activeIdx] = {
          ...updated[activeIdx],
          selectedOption,
          status: 'answered'
        };
      }
      return updated;
    });

    const newCompleted = [...completedSections, activeSectionName];
    setCompletedSections(newCompleted);
    setActiveSectionName(null);
    setShowSectionSubmitModal(false);

    // If all completed, trigger submit
    if (newCompleted.length === 4) {
      setSubmitting(true);
      // Wait a tick for states to update, then submit
      setTimeout(() => {
        submitEntireExam(newCompleted);
      }, 100);
    } else {
      // Start 5 minute break timer
      setBreakTimeLeft(300);
    }
  };

  const handleSectionTimeout = () => {
    alert(`Time limit reached for ${activeSectionName}! Saving and closing section.`);
    submitActiveSection();
  };

  // Controls Logic
  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleSaveAndNext = () => {
    if (!selectedOption) {
      alert('Please select an option first. To skip, use next or skip.');
      return;
    }

    setUserAnswers(prev => {
      const updated = [...prev];
      updated[activeIdx] = {
        ...updated[activeIdx],
        selectedOption,
        status: 'answered'
      };
      return updated;
    });

    if (currentQIndexInSection < sectionQuestions.length - 1) {
      const nextQInSec = sectionQuestions[currentQIndexInSection + 1];
      const overallIdx = questions.findIndex(q => q.questionNumber === nextQInSec.questionNumber);
      if (overallIdx !== -1) setActiveIdx(overallIdx);
    } else {
      setShowSectionSubmitModal(true);
    }
  };

  const handleMarkForReview = () => {
    setUserAnswers(prev => {
      const updated = [...prev];
      const newStatus = selectedOption ? 'answered-marked' : 'marked';
      updated[activeIdx] = {
        ...updated[activeIdx],
        selectedOption,
        status: newStatus
      };
      return updated;
    });

    if (currentQIndexInSection < sectionQuestions.length - 1) {
      const nextQInSec = sectionQuestions[currentQIndexInSection + 1];
      const overallIdx = questions.findIndex(q => q.questionNumber === nextQInSec.questionNumber);
      if (overallIdx !== -1) setActiveIdx(overallIdx);
    } else {
      setShowSectionSubmitModal(true);
    }
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[activeIdx] = {
        ...updated[activeIdx],
        selectedOption: null,
        status: 'visited'
      };
      return updated;
    });
  };

  const handlePrev = () => {
    if (currentQIndexInSection > 0) {
      const prevQInSec = sectionQuestions[currentQIndexInSection - 1];
      const overallIdx = questions.findIndex(q => q.questionNumber === prevQInSec.questionNumber);
      if (overallIdx !== -1) setActiveIdx(overallIdx);
    }
  };

  const handleNext = () => {
    if (currentQIndexInSection < sectionQuestions.length - 1) {
      setUserAnswers(prev => {
        const updated = [...prev];
        if (updated[activeIdx].status === 'not-visited') {
          updated[activeIdx].status = 'visited';
        }
        return updated;
      });
      
      const nextQInSec = sectionQuestions[currentQIndexInSection + 1];
      const overallIdx = questions.findIndex(q => q.questionNumber === nextQInSec.questionNumber);
      if (overallIdx !== -1) setActiveIdx(overallIdx);
    }
  };

  // Submit entire exam helper
  const submitEntireExam = async (completedList = completedSections) => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(breakTimerRef.current);

    const answersPayload = userAnswers.map(ans => ({
      questionNumber: ans.questionNumber,
      section: ans.section,
      topic: ans.topic,
      selectedOption: ans.selectedOption,
      status: ans.status
    }));

    try {
      // Calculate total time taken as sum of elapsed section times
      const totalElapsedSeconds = Object.values(sectionElapsed).reduce((a, b) => a + b, 0);

      const res = await api.post('/attempts', {
        quizId: quiz._id,
        answers: answersPayload,
        timeTaken: totalElapsedSeconds
      });
      const attemptData = res.data.data;
      navigate(`/result/${attemptData._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit attempt.');
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = () => {
    setShowSubmitModal(false);
    submitEntireExam();
  };

  // Palette counts for active section
  const sectionAnswers = userAnswers.filter(ans => ans.section === activeSectionName);
  const statsCounts = sectionAnswers.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    { 'not-visited': 0, 'visited': 0, 'answered': 0, 'marked': 0, 'answered-marked': 0 }
  );

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 select-none overflow-hidden font-sans">
      
      {/* Top Header: CBT Styling */}
      <header className="flex justify-between items-center bg-slate-800 text-white px-6 py-3 border-b-4 border-slate-700">
        <div>
          <h1 className="font-extrabold text-base tracking-wide text-brand-400 uppercase">SSC CGL Online Exam Simulator</h1>
          <p className="text-2xs text-slate-400 uppercase tracking-wider">{quiz.quizName}</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-2xs font-extrabold tracking-widest text-slate-300 uppercase bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg">
            Active: {activeSectionName}
          </span>
          {/* Sectional Timer Display */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-yellow-400 font-mono font-bold text-sm">
            <Clock size={16} />
            <span>Section Time: {formatSectionTime(sectionTimeLeft)}</span>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10"
          >
            Submit Entire Exam
          </button>
        </div>
      </header>

      {/* Sections Tab Bar - Displaying locks/completed status */}
      <nav className="flex bg-slate-200 border-b border-slate-300">
        {sectionsList.map((secName) => {
          const isActive = activeSectionName === secName;
          const isDone = completedSections.includes(secName);
          const count = questions.filter(q => q.section === secName).length;
          if (count === 0) return null;

          let tabStyle = "text-slate-400 bg-slate-100 cursor-not-allowed"; //Locked
          if (isActive) {
            tabStyle = "bg-white text-brand-600 border-b-2 border-b-brand-500";
          } else if (isDone) {
            tabStyle = "text-slate-500 bg-slate-150 line-through cursor-not-allowed";
          }

          return (
            <div
              key={secName}
              className={`px-6 py-3 text-xs font-bold transition-colors border-r border-slate-300 flex items-center gap-1.5 ${tabStyle}`}
            >
              <span>{secName}</span>
              <span className="text-3xs font-normal">({count} Qs)</span>
              {isDone && <span className="text-3xs text-emerald-600 font-extrabold">[Submitted]</span>}
            </div>
          );
        })}
      </nav>

      {/* Main Grid split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Question Pane */}
        <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto">
          {/* Question Meta info */}
          <div className="flex justify-between items-center px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="font-bold text-slate-600">
              Section Question No. {currentQIndexInSection + 1} of {sectionQuestions.length}
            </div>
            <div className="flex gap-4">
              <span className="text-emerald-600 font-semibold">Correct: +{quiz.positiveMarking}</span>
              <span className="text-red-500 font-semibold">Negative: -{quiz.negativeMarking}</span>
              <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded font-medium capitalize">
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text & Options */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question:</h3>
              <p className="text-base text-slate-900 leading-relaxed font-medium font-sans whitespace-pre-wrap">
                {currentQ.question}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Answer:</h4>
              {Object.keys(currentQ.options).map(optKey => {
                const isSelected = selectedOption === optKey;
                return (
                  <button
                    key={optKey}
                    onClick={() => handleOptionChange(optKey)}
                    className={`flex items-center gap-4 w-full rounded-2xl border p-4 text-left text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected ? <Check size={12} className="stroke-[3]" /> : optKey}
                    </div>
                    <span>{currentQ.options[optKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controllers */}
          <div className="flex justify-between items-center bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex gap-2">
              <button
                onClick={handleMarkForReview}
                className="rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-sm"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-sm"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentQIndexInSection === 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQIndexInSection === sectionQuestions.length - 1}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
                <ChevronRight size={16} />
              </button>
              
              {currentQIndexInSection === sectionQuestions.length - 1 ? (
                <button
                  onClick={() => setShowSectionSubmitModal(true)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-6 py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/10 animate-pulse-subtle"
                >
                  Submit Section
                </button>
              ) : (
                <button
                  onClick={handleSaveAndNext}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white px-6 py-2.5 text-xs font-bold transition-all shadow-md shadow-brand-500/10"
                >
                  Save & Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Palette and Profile */}
        <aside className="w-80 border-l border-slate-200 bg-white flex flex-col justify-between overflow-y-auto">
          {/* User Details box */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-300">
              <User size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Candidate</p>
              <p className="text-sm font-bold text-slate-800 truncate">Test Taker</p>
              <p className="text-3xs text-slate-500 truncate uppercase">Category: {isScribe ? 'Scribe' : 'Regular'}</p>
            </div>
          </div>

          {/* Palette Questions Grid */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Section Palette ({activeSectionName})
            </h4>
            
            {/* Grid display */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const ansState = userAnswers[idx];
                if (!ansState) return null;

                const isSelectedSection = q.section === activeSectionName;
                if (!isSelectedSection) return null;

                const isActive = activeIdx === idx;
                
                // State classes
                let stateClass = 'bg-slate-200 border-slate-300 text-slate-700'; // not-visited
                
                if (ansState.status === 'visited') {
                  stateClass = 'bg-red-500 border-red-600 text-white'; // visited but not answered
                } else if (ansState.status === 'answered') {
                  stateClass = 'bg-emerald-500 border-emerald-600 text-white'; // answered
                } else if (ansState.status === 'marked') {
                  stateClass = 'bg-purple-500 border-purple-600 text-white rounded-t-none rounded-br-none'; // marked for review
                } else if (ansState.status === 'answered-marked') {
                  stateClass = 'bg-indigo-500 border-indigo-600 text-white rounded-t-none rounded-br-none relative'; // answered & marked (will overlay tick)
                }

                const indexInSec = sectionQuestions.findIndex(sq => sq.questionNumber === q.questionNumber) + 1;

                return (
                  <button
                    key={q.questionNumber}
                    onClick={() => setActiveIdx(idx)}
                    className={`flex h-9 w-9 items-center justify-center text-xs font-extrabold border-2 rounded-xl transition-all ${stateClass} ${
                      isActive ? 'ring-2 ring-brand-500 ring-offset-2 scale-105' : 'hover:opacity-95'
                    }`}
                  >
                    {indexInSec}
                    {ansState.status === 'answered-marked' && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 border border-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Coding Legend */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-2xs space-y-2">
            <h5 className="font-bold text-slate-500 uppercase tracking-wider text-3xs">Legend</h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 bg-slate-200 border border-slate-300 rounded-md" />
                <span>Not Visited ({statsCounts['not-visited']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 bg-red-500 border border-red-600 rounded-md" />
                <span>Not Answered ({statsCounts['visited']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 bg-emerald-500 border border-emerald-600 rounded-md" />
                <span>Answered ({statsCounts['answered']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 bg-purple-500 border border-purple-600 rounded-md" />
                <span>Marked ({statsCounts['marked']})</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <div className="h-4 w-4 bg-indigo-500 border border-indigo-600 rounded-md relative flex items-center justify-center text-white font-bold text-3xs">
                  ✓
                </div>
                <span>Answered & Marked ({statsCounts['answered-marked']})</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Section Submit Modal */}
      {showSectionSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-indigo-500 mb-4">
              <CheckCircle size={28} />
              <h3 className="text-lg font-bold text-slate-900">Submit Section?</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to submit the <strong>{activeSectionName}</strong> section? 
              <span className="text-red-500 font-bold block mt-1">⚠️ You will not be able to return to this section.</span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSectionSubmitModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitActiveSection}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm font-semibold transition-all shadow-md shadow-indigo-600/10"
              >
                {completedSections.length < 3 ? 'Yes, Submit Section' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entire Exam Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-brand-500 mb-4">
              <CheckCircle size={28} />
              <h3 className="text-lg font-bold text-slate-900">Submit Entire Exam?</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to submit the entire exam? Any unsubmitted sections will be saved with current progress and locked.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Back to Exam
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader className="animate-spin" size={14} /> : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;
