import React from 'react';
import { BookOpen, Moon, Sun, Search, Code, FileText, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { useCourse } from '../context/CourseContext';

export default function Header() {
  const {
    theme,
    toggleTheme,
    getOverallProgress,
    activeTab,
    setActiveTab,
    setIsCheatSheetOpen,
    setIsSearchOpen,
    setIsCertificateOpen,
    resetAllProgress
  } = useCourse();

  const progressPercent = getOverallProgress();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('lesson')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                آموزش جامع پایتون
              </h1>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                جعفرنژاد قمی
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              سامانه تعاملی و خودآموز فصول ۱، ۲ و ۳
            </p>
          </div>
        </div>

        {/* Center: Overall Progress Bar */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>پیشرفت کل:</span>
          </div>
          <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {progressPercent}٪
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            title="جستجو در درس‌ها (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">جستجو...</span>
          </button>

          {/* Quick Cheat Sheet */}
          <button
            onClick={() => setIsCheatSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            title="تقلب‌نامه و مرجع سریع فرمول‌ها"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">تقلب‌نامه</span>
          </button>

          {/* Code Playground Tab Trigger */}
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-sm ${
              activeTab === 'playground'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>ویرایشگر کد</span>
          </button>

          {/* Certificate of Completion */}
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl transition border border-amber-200/60 dark:border-amber-800/60"
            title="مشاهده و چاپ گواهی پایان دوره"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">گواهی دوره</span>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            title={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Reset progress */}
          <button
            onClick={resetAllProgress}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition hidden md:block"
            title="بازنشانی پیشرفت دوره"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
