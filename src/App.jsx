import React from 'react';
import { CourseProvider, useCourse } from './context/CourseContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import ChallengeView from './components/ChallengeView';
import CodePlayground from './components/CodePlayground';
import CheatSheetModal from './components/CheatSheetModal';
import SearchModal from './components/SearchModal';
import CertificateModal from './components/CertificateModal';
import { BookOpen, HelpCircle, Code2, Terminal } from 'lucide-react';

function MainContent() {
  const {
    activeTab,
    setActiveTab,
    currentChapter,
    playgroundCode,
    isCertificateOpen,
    setIsCertificateOpen
  } = useCourse();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Tab Switcher at the top of content area */}
      {activeTab !== 'playground' && (
        <div className="max-w-4xl mx-auto w-full mb-6 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'lesson'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>آموزش و درس‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'quiz'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>آزمون ۴ گزینه‌ای ({currentChapter.quizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('challenge')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'challenge'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>چالش‌های کدنویسی ({currentChapter.challenges.length})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('playground')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">کنسول زنده پایتون</span>
          </button>
        </div>
      )}

      {/* Dynamic View rendering */}
      {activeTab === 'lesson' && <LessonView />}
      {activeTab === 'quiz' && <QuizView />}
      {activeTab === 'challenge' && <ChallengeView />}
      {activeTab === 'playground' && (
        <CodePlayground
          initialCode={playgroundCode}
          onBack={() => setActiveTab('lesson')}
        />
      )}

      {/* Global Modals */}
      <CheatSheetModal />
      <SearchModal />
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CourseProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Header />
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </CourseProvider>
  );
}
