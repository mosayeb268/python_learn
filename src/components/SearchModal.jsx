import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, HelpCircle, Code2, ArrowLeft } from 'lucide-react';
import { searchCourse } from '../data';
import { useCourse } from '../context/CourseContext';

export default function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveChapterId,
    setActiveLessonId,
    setActiveTab
  } = useCourse();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const handleSearch = (val) => {
    setQuery(val);
    const res = searchCourse(val);
    setResults(res);
  };

  const handleSelectResult = (item) => {
    setActiveChapterId(item.chapterId);
    if (item.type === 'lesson') {
      setActiveLessonId(item.itemId);
      setActiveTab('lesson');
    } else if (item.type === 'quiz') {
      setActiveTab('quiz');
    } else if (item.type === 'challenge') {
      setActiveTab('challenge');
    }
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[75vh] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="جستجو در ۳ فصل (مثال: print، معادله درجه دو، تورفتگی، input، elif)..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(item)}
                className="w-full p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition text-right flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl mt-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                    {item.type === 'lesson' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'quiz' && <HelpCircle className="w-4 h-4" />}
                    {item.type === 'challenge' && <Code2 className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {item.chapterTitle}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {item.title}
                    </h4>
                    {item.snippet && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </div>

                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
              </button>
            ))
          ) : query.trim() ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              هیچ نتیجه‌ای برای «{query}» یافت نشد.
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              کلمه یا موضوع مورد نظر خود را تایپ کنید (مثلاً: <span className="font-mono text-indigo-500">float</span> یا <span className="font-mono text-indigo-500">else</span> یا <span className="font-mono text-indigo-500">تورفتگی</span>).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
