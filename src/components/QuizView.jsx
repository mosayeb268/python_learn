import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Sparkles,
  Code2
} from 'lucide-react';
import { useCourse } from '../context/CourseContext';

export default function QuizView() {
  const { currentChapter, quizAnswers, recordQuizAnswer, setActiveTab } = useCourse();

  const quizzes = currentChapter.quizzes;
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuiz = quizzes[currentIndex];
  const userResult = quizAnswers[currentQuiz.id];

  const handleSelectOption = (optionIndex) => {
    if (userResult !== undefined) return; // Prevent changing after answer
    const isCorrect = optionIndex === currentQuiz.correctIndex;
    recordQuizAnswer(currentQuiz.id, optionIndex, isCorrect);
  };

  // Calculate results for current chapter
  const answeredCount = quizzes.filter((q) => quizAnswers[q.id] !== undefined).length;
  const correctCount = quizzes.filter(
    (q) => quizAnswers[q.id] && quizAnswers[q.id].isCorrect
  ).length;
  const scorePercent = quizzes.length > 0 ? Math.round((correctCount / quizzes.length) * 100) : 0;
  const isFinished = answeredCount === quizzes.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Quiz Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                آزمون تستی و سنجش یادگیری: {currentChapter.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سوال {currentIndex + 1} از {quizzes.length} • سنجش تسلط بر مفاهیم کلیدی فصل
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left font-mono">
            <span className="text-xs text-slate-400">نمره کسب شده:</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {correctCount} از {quizzes.length} ({scorePercent}٪)
            </div>
          </div>
        </div>
      </div>

      {/* Question Steps Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quizzes.map((quiz, idx) => {
          const ans = quizAnswers[quiz.id];
          const isCurrent = idx === currentIndex;

          let badgeColor = 'bg-slate-200 dark:bg-slate-800 text-slate-500';
          if (ans) {
            badgeColor = ans.isCorrect
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white';
          } else if (isCurrent) {
            badgeColor = 'bg-amber-500 text-white ring-2 ring-amber-300 dark:ring-amber-700';
          }

          return (
            <button
              key={quiz.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 min-w-[40px] h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center ${badgeColor}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-4">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
            سوال شماره {currentIndex + 1}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuiz.question}
          </h3>

          {/* Code snippet in question if any */}
          {currentQuiz.code && (
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto">
              <pre
                className="font-mono text-xs sm:text-sm text-emerald-300 leading-6"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                {currentQuiz.code}
              </pre>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQuiz.options.map((option, optIdx) => {
            const isSelected = userResult && userResult.optionIndex === optIdx;
            const isThisCorrect = optIdx === currentQuiz.correctIndex;
            const hasAnswered = userResult !== undefined;

            let btnStyle =
              'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50/30';

            if (hasAnswered) {
              if (isThisCorrect) {
                btnStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (isSelected) {
                btnStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
              } else {
                btnStyle =
                  'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/20 text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-2xl border text-right transition flex items-center justify-between gap-3 text-xs sm:text-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {optIdx + 1}
                  </span>
                  <span className="leading-6">{option}</span>
                </div>

                {hasAnswered && (
                  <div>
                    {isThisCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Box */}
        {userResult !== undefined && (
          <div
            className={`p-5 rounded-2xl border text-xs sm:text-sm leading-6 space-y-2 animate-fadeIn ${
              userResult.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{userResult.isCorrect ? 'آفرین! پاسخ شما صحیح است.' : 'تحلیل و تشریح پاسخ:'}</span>
            </div>
            <p className="font-normal">{currentQuiz.explanation}</p>
          </div>
        )}

        {/* Navigation bottom buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>سوال قبلی</span>
          </button>

          {currentIndex < quizzes.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
            >
              <span>سوال بعدی</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('challenge')}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>ورود به چالش‌های کدنویسی فصل</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion Trophy Card */}
      {isFinished && (
        <div className="bg-gradient-to-r from-amber-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Award className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-black">آزمون این فصل تکمیل شد!</h3>
              <p className="text-xs text-white/90 mt-1">
                نمره نهایی شما: {scorePercent}٪ ({correctCount} پاسخ درست از {quizzes.length} سوال)
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('challenge')}
            className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition"
          >
            ادامه به تمرین‌های کدنویسی
          </button>
        </div>
      )}
    </div>
  );
}
