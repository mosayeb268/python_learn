import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  Play,
  RotateCcw,
  HelpCircle,
  Eye,
  Award,
  Terminal,
  ChevronDown
} from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { runPythonCode } from '../utils/pythonRunner';

export default function ChallengeView() {
  const { currentChapter, completedChallenges, markChallengeComplete } = useCourse();
  const challenges = currentChapter.challenges;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentChallenge = challenges[selectedIdx];

  const [userCode, setUserCode] = useState(currentChallenge.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null); // { passed: boolean, message: string }
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Sync starter code when changing challenge
  const handleSelectChallenge = (idx) => {
    setSelectedIdx(idx);
    setUserCode(challenges[idx].starterCode);
    setOutput('');
    setTestResult(null);
    setShowSolution(false);
    setShowHints(false);
  };

  const isCompleted = completedChallenges.includes(currentChallenge.id);

  const handleRunAndTest = () => {
    setOutput('');
    setTestResult(null);
    setIsRunning(true);

    let collectedOutput = '';

    runPythonCode({
      code: userCode,
      onOutput: (text) => {
        collectedOutput += text;
        setOutput((prev) => prev + text);
      },
      onFinished: () => {
        setIsRunning(false);

        // Auto-grade against testCases
        if (currentChallenge.testCases && currentChallenge.testCases.length > 0) {
          let allPassed = true;
          let failMessage = '';

          for (const tc of currentChallenge.testCases) {
            if (tc.pattern && !collectedOutput.includes(tc.pattern)) {
              allPassed = false;
              failMessage = `خروجی برنامه شامل عبارت مورد انتظار "${tc.pattern}" نبود.`;
              break;
            }
          }

          if (allPassed) {
            setTestResult({
              passed: true,
              message: 'تبریک! برنامه شما با موفقیت اجرا شد و تمام تست‌ها را پاس کرد.'
            });
            markChallengeComplete(currentChallenge.id);
          } else {
            setTestResult({
              passed: false,
              message: failMessage || 'خروجی کد با انتظار مسئله مطابقت ندارد. کد خود را بازبینی کنید.'
            });
          }
        } else {
          setTestResult({
            passed: true,
            message: 'کد بدون خطا اجرا شد.'
          });
          markChallengeComplete(currentChallenge.id);
        }
      },
      onError: (err) => {
        setIsRunning(false);
        setTestResult({
          passed: false,
          message: `خطا در اجرای برنامه: ${err.title || err.raw}`
        });
      }
    });
  };

  const handleReset = () => {
    setUserCode(currentChallenge.starterCode);
    setOutput('');
    setTestResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Challenges Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {challenges.map((ch, idx) => {
            const isDone = completedChallenges.includes(ch.id);
            const isCurrent = idx === selectedIdx;

            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChallenge(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{ch.title}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800/80 shrink-0">
          سطح: {currentChallenge.difficulty}
        </span>
      </div>

      {/* Challenge Description Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {currentChallenge.title}
          </h2>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>پاس شده</span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-7 whitespace-pre-line">
          {currentChallenge.description}
        </p>

        {/* Hints and Solution Accordion */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {currentChallenge.hints && (
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>راهنما (Hint)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition ${showHints ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>مشاهده راه‌حل نمونه</span>
            <ChevronDown className={`w-3.5 h-3.5 transition ${showSolution ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Hints dropdown */}
        {showHints && currentChallenge.hints && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2 text-xs text-amber-900 dark:text-amber-200">
            <h4 className="font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>نکات کمکی برای حل مسئله:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pr-2">
              {currentChallenge.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution dropdown */}
        {showSolution && currentChallenge.solution && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-300">کد راه‌حل پیشنهادی:</h4>
            <pre
              className="font-mono text-xs text-emerald-400 overflow-x-auto leading-5"
              style={{ direction: 'ltr', textAlign: 'left' }}
            >
              {currentChallenge.solution}
            </pre>
          </div>
        )}
      </div>

      {/* In-place Code Editor & Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">کد تمرین (solution.py)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="بازنشانی کد اولیه"
                className="text-xs text-slate-400 hover:text-white p-1 rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-4 font-mono text-xs text-emerald-300 bg-transparent resize-none outline-none leading-6"
            style={{ direction: 'ltr', textAlign: 'left', tabSize: 4 }}
          />
        </div>

        {/* Output & Test Runner Console */}
        <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>نتیجه ارزیابی و خروجی</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {output ? (
              <pre
                className="font-mono text-xs text-emerald-400 leading-5 whitespace-pre-wrap"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                {output}
              </pre>
            ) : (
              <p className="text-xs text-slate-600 font-sans text-center mt-12">
                کد خود را تکمیل کنید و دکمه «ارزیابی خودکار» را بزنید.
              </p>
            )}

            {testResult && (
              <div
                className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  testResult.passed
                    ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-700 text-rose-300'
                }`}
              >
                {testResult.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={handleRunAndTest}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'در حال تست...' : 'ارزیابی خودکار کد'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
