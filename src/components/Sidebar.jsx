import React, { useState } from 'react';
import {
  ChevronDown,
  CheckCircle,
  Circle,
  HelpCircle,
  Code2,
  Terminal,
  Variable,
  GitFork,
  BookOpen
} from 'lucide-react';
import { allChapters } from '../data';
import { useCourse } from '../context/CourseContext';

const CHAPTER_ICONS = {
  Terminal: Terminal,
  Variable: Variable,
  GitFork: GitFork
};

export default function Sidebar() {
  const {
    activeChapterId,
    setActiveChapterId,
    activeTab,
    setActiveTab,
    activeLessonId,
    setActiveLessonId,
    completedLessons,
    getChapterProgress
  } = useCourse();

  // Accordion state for expanded chapters
  const [expandedChapters, setExpandedChapters] = useState({
    'chapter-1': true,
    'chapter-2': true,
    'chapter-3': true
  });

  const toggleChapterExpand = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const selectLesson = (chapterId, lessonId) => {
    setActiveChapterId(chapterId);
    setActiveLessonId(lessonId);
    setActiveTab('lesson');
  };

  const selectQuiz = (chapterId) => {
    setActiveChapterId(chapterId);
    setActiveTab('quiz');
  };

  const selectChallenge = (chapterId) => {
    setActiveChapterId(chapterId);
    setActiveTab('challenge');
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 transition-colors">
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          فهرست سرفصل‌های کتاب
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ۳ فصل اول کتاب آموزش جامع پایتون
        </p>
      </div>

      <div className="space-y-4">
        {allChapters.map((chapter) => {
          const isExpanded = expandedChapters[chapter.id];
          const isCurrentChapter = activeChapterId === chapter.id;
          const progress = getChapterProgress(chapter.id);
          const IconComponent = CHAPTER_ICONS[chapter.icon] || BookOpen;

          return (
            <div
              key={chapter.id}
              className={`rounded-2xl border transition overflow-hidden ${
                isCurrentChapter
                  ? 'border-indigo-300 dark:border-indigo-900/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Chapter Accordion Header */}
              <button
                onClick={() => toggleChapterExpand(chapter.id)}
                className="w-full p-3.5 flex items-start justify-between text-right gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`p-2 rounded-xl mt-0.5 ${
                      isCurrentChapter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {chapter.lessons.length} درس
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {progress}٪ تکمیل
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 mt-1 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Chapter Items List */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-1 border-t border-slate-100 dark:border-slate-800/60">
                  {/* Lessons */}
                  {chapter.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isSelected =
                      activeTab === 'lesson' &&
                      activeChapterId === chapter.id &&
                      activeLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(chapter.id, lesson.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition font-medium ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate flex-1 pl-2">{lesson.title}</span>
                        {isCompleted ? (
                          <CheckCircle
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-white' : 'text-emerald-500'
                            }`}
                          />
                        ) : (
                          <Circle
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-indigo-300' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}

                  {/* Quizzes Button */}
                  <button
                    onClick={() => selectQuiz(chapter.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs font-bold transition mt-2 ${
                      activeTab === 'quiz' && activeChapterId === chapter.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>آزمون ۴ گزینه‌ای فصل {chapter.number}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/50 dark:bg-amber-900/50">
                      {chapter.quizzes.length} سوال
                    </span>
                  </button>

                  {/* Coding Challenges Button */}
                  <button
                    onClick={() => selectChallenge(chapter.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs font-bold transition ${
                      activeTab === 'challenge' && activeChapterId === chapter.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>چالش‌های کدنویسی فصل {chapter.number}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-200/50 dark:bg-teal-900/50">
                      {chapter.challenges.length} تمرین
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
