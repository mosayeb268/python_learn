import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  HelpCircle,
  Eye,
  Award,
  Terminal,
  ChevronDown,
  Sparkles,
  Check,
  Flame
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
  const [testResults, setTestResults] = useState(null); // array of { name, passed, expected, actual }
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [mode, setMode] = useState('test'); // 'test' | 'interactive'
  const [inputPrompt, setInputPrompt] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputCallbackRef = React.useRef(null);
  const inputFieldRef = React.useRef(null);

  const isCompleted = completedChallenges.includes(currentChallenge.id);

  // Sync when changing challenge
  const handleSelectChallenge = (idx) => {
    setSelectedIdx(idx);
    setUserCode(challenges[idx].starterCode);
    setOutput('');
    setTestResults(null);
    setShowSolution(false);
    setShowHints(false);
    setInputPrompt(null);
  };

  // Tab key intercepting for Python indentation in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = userCode;
      setUserCode(value.substring(0, start) + '    ' + value.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run a single test case promise
  const runSingleTest = (testCase) => {
    return new Promise((resolve) => {
      let runOutput = '';
      const inputList = testCase.inputs
        ? testCase.inputs
        : testCase.input
        ? testCase.input.trim().split('\n')
        : [];

      runPythonCode({
        code: userCode,
        predefinedInputs: inputList,
        timeoutMs: 5000,
        onOutput: (txt) => {
          runOutput += txt;
        },
        onFinished: () => {
          const passed = testCase.pattern ? runOutput.includes(testCase.pattern) : true;
          resolve({
            name: testCase.name || 'تست',
            passed,
            expected: testCase.pattern || 'اجرای بدون خطا',
            actual: runOutput.trim()
          });
        },
        onError: (err) => {
          resolve({
            name: testCase.name || 'تست',
            passed: false,
            expected: testCase.pattern || 'اجرای بدون خطا',
            actual: `خطا: ${err.title || err.raw}`
          });
        }
      });
    });
  };

  // Auto-grade ALL test cases sequentially
  const handleRunAllTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    setOutput('در حال اجرای تست‌های خودکار...\n');
    setMode('test');

    const results = [];
    const tcs = currentChallenge.testCases || [
      { name: 'اجرای موفق بدون خطای زمان اجرا', pattern: '' }
    ];

    for (let i = 0; i < tcs.length; i++) {
      setOutput((prev) => prev + `• در حال بررسی ${tcs[i].name}...\n`);
      const res = await runSingleTest(tcs[i]);
      results.push(res);
    }

    setTestResults(results);
    setIsRunning(false);

    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      setOutput((prev) => prev + '\n🎉 تبریک! تمامی تست‌کیس‌ها با موفقیت پاس شدند.\n');
      markChallengeComplete(currentChallenge.id);
    } else {
      setOutput((prev) => prev + '\n❌ برخی از تست‌ها رد شدند. خروجی تست‌ها را بررسی و کد را اصلاح کنید.\n');
    }
  };

  // Interactive manual run
  const handleInteractiveRun = () => {
    setOutput('');
    setTestResults(null);
    setInputPrompt(null);
    setIsRunning(true);
    setMode('interactive');

    runPythonCode({
      code: userCode,
      onOutput: (text) => setOutput((prev) => prev + text),
      onInputRequired: (promptText, resolve) => {
        setInputPrompt(promptText || 'ورودی: ');
        inputCallbackRef.current = resolve;
      },
      onFinished: () => {
        setIsRunning(false);
        setOutput((prev) => prev + '\n[پایان اجرای برنامه]');
      },
      onError: (err) => {
        setIsRunning(false);
        setOutput((prev) => prev + `\n❌ ${err.title}: ${err.description}\n${err.raw}`);
      }
    });
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputCallbackRef.current) {
      const val = inputValue;
      setInputValue('');
      setInputPrompt(null);
      const cb = inputCallbackRef.current;
      inputCallbackRef.current = null;
      cb(val);
    }
  };

  const handleReset = () => {
    if (window.confirm('آیا مایلید کد تمرین را به قالب اولیه بازنشانی کنید؟')) {
      setUserCode(currentChallenge.starterCode);
      setOutput('');
      setTestResults(null);
    }
  };

  // Line numbers calculation
  const lineCount = userCode.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Challenges Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800/80 shrink-0">
            سطح: {currentChallenge.difficulty}
          </span>
        </div>
      </div>

      {/* Challenge Description Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {currentChallenge.title}
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>چالش پاس شده</span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-7 whitespace-pre-line font-sans">
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
              <span>راهنما (Hints)</span>
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
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
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
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300">کد راه‌حل پیشنهادی:</h4>
              <button
                onClick={() => setUserCode(currentChallenge.solution)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                کپی به ویرایشگر
              </button>
            </div>
            <pre
              className="font-mono text-xs text-emerald-400 overflow-x-auto leading-5"
              style={{ direction: 'ltr', textAlign: 'left' }}
            >
              {currentChallenge.solution}
            </pre>
          </div>
        )}
      </div>

      {/* Editor & Test Results Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col min-h-[400px] shadow-md">
          <div
            className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800"
            dir="ltr"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block"></span>
              <span className="text-xs font-mono text-slate-300 font-bold ml-2">solution.py</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-sans">Python 3</span>
              <button
                onClick={handleReset}
                title="بازنشانی کد اولیه"
                className="text-xs text-slate-400 hover:text-white p-1 rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 overflow-hidden code-editor-wrapper" dir="ltr">
            <CodeMirror
              value={userCode}
              height="360px"
              extensions={[
                python(),
                EditorView.lineWrapping
              ]}
              theme={oneDark}
              onChange={(val) => setUserCode(val)}
              className="h-full text-xs"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
                tabSize: 4
              }}
            />
          </div>
        </div>

        {/* Console & Test Results Matrix */}
        <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between min-h-[400px] shadow-md">
          <div
            className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800"
            dir="ltr"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90"></span>
              <div className="flex items-center gap-1.5 ml-2 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-xs font-bold font-sans">کنسول و نتایج تست‌ها</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span className="text-slate-400">{isRunning ? 'در حال اجرا' : 'آماده'}</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
            {/* Terminal text output */}
            {output ? (
              <pre
                className="terminal-output text-emerald-400 leading-relaxed"
                style={{
                  unicodeBidi: 'plaintext',
                  textAlign: 'start'
                }}
              >
                {output}
              </pre>
            ) : (
              <div className="text-center py-16 text-slate-600 font-sans">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40 text-teal-400" />
                <p>کد را بنویسید و دکمه «ارزیابی خودکار با تست‌کیس‌ها» را بزنید.</p>
              </div>
            )}

            {/* Test Case Cards Matrix */}
            {testResults && (
              <div className="space-y-2 pt-2 border-t border-slate-800 font-sans">
                <h4 className="text-xs font-bold text-slate-300">گزارش آزمون‌های خودکار:</h4>
                {testResults.map((tr, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      tr.passed
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {tr.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{tr.name}</div>
                        {tr.expected && (
                          <div className="text-[11px] opacity-80 mt-0.5 font-mono" dir="ltr">
                            Expected: {tr.expected}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold shrink-0">
                      {tr.passed ? 'پاس شد ✅' : 'رد شد ❌'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Input form if running manually with input() */}
            {inputPrompt && (
              <form
                onSubmit={handleInputSubmit}
                className="mt-3 p-2 bg-indigo-950 border border-indigo-700 rounded-xl flex items-center gap-2"
              >
                <span className="text-indigo-300 text-xs shrink-0" dir="ltr">
                  {inputPrompt}
                </span>
                <input
                  ref={inputFieldRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ورودی را تایپ و Enter بزنید..."
                  className="flex-1 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-xs text-white outline-none font-mono"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded font-bold"
                >
                  ارسال
                </button>
              </form>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleInteractiveRun}
              disabled={isRunning}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="اجرای دستی کد با امکان تایپ مقادیر ورودی در ترمینال"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>اجرای دستی (Interactive)</span>
            </button>

            <button
              onClick={handleRunAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'در حال ارزیابی...' : 'ارزیابی خودکار با تست‌کیس‌ها'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
