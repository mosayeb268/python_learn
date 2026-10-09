import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Clock,
  CheckCircle,
  Circle,
  Play,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { allChapters } from '../data';

export default function LessonView() {
  const {
    currentChapter,
    currentLesson,
    completedLessons,
    markLessonComplete,
    openPlaygroundWithCode,
    setActiveLessonId,
    setActiveChapterId,
    setActiveTab
  } = useCourse();

  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!currentLesson) return null;

  const isCompleted = completedLessons.includes(currentLesson.id);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Find next and previous lessons
  const currentChapterIndex = allChapters.findIndex((c) => c.id === currentChapter.id);
  const currentLessonIndex = currentChapter.lessons.findIndex((l) => l.id === currentLesson.id);

  let prevLesson = null;
  let nextLesson = null;

  if (currentLessonIndex > 0) {
    prevLesson = {
      chapterId: currentChapter.id,
      lessonId: currentChapter.lessons[currentLessonIndex - 1].id,
      title: currentChapter.lessons[currentLessonIndex - 1].title
    };
  } else if (currentChapterIndex > 0) {
    const prevCh = allChapters[currentChapterIndex - 1];
    const lastL = prevCh.lessons[prevCh.lessons.length - 1];
    prevLesson = {
      chapterId: prevCh.id,
      lessonId: lastL.id,
      title: lastL.title
    };
  }

  if (currentLessonIndex < currentChapter.lessons.length - 1) {
    nextLesson = {
      chapterId: currentChapter.id,
      lessonId: currentChapter.lessons[currentLessonIndex + 1].id,
      title: currentChapter.lessons[currentLessonIndex + 1].title
    };
  } else if (currentChapterIndex < allChapters.length - 1) {
    const nextCh = allChapters[currentChapterIndex + 1];
    const firstL = nextCh.lessons[0];
    nextLesson = {
      chapterId: nextCh.id,
      lessonId: firstL.id,
      title: firstL.title
    };
  }

  const navigateTo = (nav) => {
    setActiveChapterId(nav.chapterId);
    setActiveLessonId(nav.lessonId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Lesson Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-900/50">
            {currentChapter.title}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>زمان تقریبی مطالعه: {currentLesson.readTime}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {currentLesson.title}
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {currentLesson.summary}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => markLessonComplete(currentLesson.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>این درس مطالعه شده است</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-400" />
                <span>علامت‌گذاری به عنوان خوانده شده</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Code2 className="w-4 h-4" />
            <span>ورود به ویرایشگر کد پایتون</span>
          </button>
        </div>
      </div>

      {/* Main Content Body with Rich React-Markdown */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-slate-800 dark:text-slate-200 text-sm leading-8 font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-8 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-6 mb-3 flex items-center gap-2"
                  {...props}
                />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-sm leading-8 text-slate-700 dark:text-slate-300 my-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-2 my-3 pr-2 text-sm text-slate-700 dark:text-slate-300 leading-7" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-2 my-3 pr-2 text-sm text-slate-700 dark:text-slate-300 leading-7" {...props} />
              ),
              li: ({ node, ...props }) => <li className="text-sm" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-r-4 border-indigo-500 pr-4 py-2 my-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-l-xl text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic"
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <table className="w-full text-right text-xs sm:text-sm border-collapse" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="p-3 border-b border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-300" {...props} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-slate-200 dark:border-slate-800" {...props} />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                if (!inline && (match || codeString.includes('\n'))) {
                  return (
                    <div className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                        <span className="font-mono text-slate-400">{match ? match[1] : 'python'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(codeString)}
                            className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 hover:bg-slate-800"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی</span>
                          </button>
                          <button
                            onClick={() => openPlaygroundWithCode(codeString)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>اجرا در ویرایشگر</span>
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-emerald-300 leading-6" dir="ltr">
                        <code>{codeString}</code>
                      </pre>
                    </div>
                  );
                }
                return (
                  <code
                    className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-xs"
                    dir="ltr"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
            }}
          >
            {currentLesson.content}
          </ReactMarkdown>
        </div>

        {/* Tips / Callout Boxes */}
        {currentLesson.tips && currentLesson.tips.length > 0 && (
          <div className="space-y-4 pt-4">
            {currentLesson.tips.map((tip, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  tip.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200'
                }`}
              >
                {tip.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">{tip.title}</h4>
                  <p className="text-xs sm:text-sm mt-1 leading-6">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Dedicated Code Examples */}
        {currentLesson.examples && currentLesson.examples.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>مثال‌های تکمیلی و کدهای اجرایی درس</span>
            </h3>

            {currentLesson.examples.map((ex, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{ex.title}</h4>
                    {ex.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{ex.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(ex.code, idx)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openPlaygroundWithCode(ex.code)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>اجرا در ویرایشگر</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 overflow-x-auto">
                  <pre
                    className="font-mono text-xs sm:text-sm text-emerald-300 leading-6"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  >
                    {ex.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons: Previous & Next Lesson */}
      <div className="flex items-center justify-between gap-4 pt-4">
        {prevLesson ? (
          <button
            onClick={() => navigateTo(prevLesson)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition shadow-sm"
          >
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            <div className="text-right">
              <span className="text-[10px] block text-slate-400 font-normal">درس قبلی</span>
              <span className="truncate max-w-[180px] sm:max-w-xs block">{prevLesson.title}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <button
            onClick={() => navigateTo(nextLesson)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-indigo-600/20"
          >
            <div className="text-left">
              <span className="text-[10px] block text-indigo-200 font-normal">درس بعدی</span>
              <span className="truncate max-w-[180px] sm:max-w-xs block">{nextLesson.title}</span>
            </div>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('quiz')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-600/20"
          >
            <span>شرکت در آزمون ۴ گزینه‌ای فصل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}
