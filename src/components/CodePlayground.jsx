import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Terminal,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Square,
  Keyboard
} from 'lucide-react';
import { runPythonCode } from '../utils/pythonRunner';

const PRESET_EXAMPLES = [
  {
    name: 'محاسبه مساحت و محیط دایره (فصل ۲)',
    code: `# محاسبه مساحت و محیط دایره
PI = 3.14159
radius = float(input("لطفاً شعاع دایره را وارد کنید: "))

area = PI * (radius ** 2)
perimeter = 2 * PI * radius

print(f"مساحت دایره با شعاع {radius} برابر است با: {area:.2f}")
print(f"محیط دایره برابر است با: {perimeter:.2f}")`
  },
  {
    name: 'تشخیص عدد زوج یا فرد (فصل ۳)',
    code: `# تشخیص زوج یا فرد بودن عدد با عملگر باقیمانده %
number = int(input("یک عدد صحیح دلخواه وارد کنید: "))

if number % 2 == 0:
    print(f"عدد {number} زوج (Even) است.")
else:
    print(f"عدد {number} فرد (Odd) است.")`
  },
  {
    name: 'حل معادله درجه دوم: ax^2 + bx + c = 0 (فصل ۳)',
    code: `# محاسبه ریشه‌های معادله درجه دو بر اساس دلتا
a = float(input("ضریب a را وارد کنید: "))
b = float(input("ضریب b را وارد کنید: "))
c = float(input("ضریب c را وارد کنید: "))

if a == 0:
    print("ضریب a صفر است؛ معادله درجه اول (خطی) است!")
else:
    delta = (b ** 2) - (4 * a * c)
    print(f"مقدار دلتا (Delta): {delta}")

    if delta > 0:
        x1 = (-b + (delta ** 0.5)) / (2 * a)
        x2 = (-b - (delta ** 0.5)) / (2 * a)
        print(f"معادله دو ریشه حقیقی دارد: x1 = {x1:.2f} و x2 = {x2:.2f}")
    elif delta == 0:
        x = -b / (2 * a)
        print(f"معادله دارای یک ریشه مضاعف است: x = {x:.2f}")
    else:
        print("دلتا منفی است؛ معادله هیچ ریشه حقیقی ندارد.")`
  },
  {
    name: 'تبدیل نوع و مقادیر بولی (فصل ۲)',
    code: `# آزمایش انواع داده‌ها و تبدیل نوع در پایتون
score1 = "18.5"
score2 = "19"

# تبدیل صریح به اعداد
avg = (float(score1) + int(score2)) / 2

print("نمره اول:", score1, "| نوع:", type(score1))
print("معدل کل:", avg, "| نوع:", type(avg))
print("آیا معدل بالاتر از ۱۷ است؟", avg >= 17)
print(f"وضعیت دانشجو: {'ممتاز' if avg >= 17 else 'عادی'}")`
  },
  {
    name: 'ماشین‌حساب هوشمند با کنترل تقسیم بر صفر (فصل ۳)',
    code: `# ماشین‌حساب چهار عمل اصلی
num1 = float(input("عدد اول: "))
op = input("عملگر (+, -, *, /): ")
num2 = float(input("عدد دوم: "))

if op == "+":
    print(f"{num1} + {num2} = {num1 + num2}")
elif op == "-":
    print(f"{num1} - {num2} = {num1 - num2}")
elif op == "*":
    print(f"{num1} * {num2} = {num1 * num2}")
elif op == "/":
    if num2 == 0:
        print("خطای ریاضی: تقسیم بر صفر ممکن نیست!")
    else:
        print(f"{num1} / {num2} = {num1 / num2}")
else:
    print("عملگر نامعتبر است!")`
  }
];

export default function CodePlayground({ initialCode, onBack }) {
  const [code, setCode] = useState(initialCode || PRESET_EXAMPLES[0].code);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  // Interactive input handling
  const [inputPrompt, setInputPrompt] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputCallbackRef = useRef(null);
  const inputFieldRef = useRef(null);
  const terminalEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (inputPrompt && inputFieldRef.current) {
      inputFieldRef.current.focus();
    }
  }, [inputPrompt]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, inputPrompt]);

  // Handle Tab key and Auto-indent in Code Editor
  const handleKeyDown = (e) => {
    // Ctrl + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
      return;
    }

    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = code;
      setCode(val.substring(0, start) + '    ' + val.substring(end));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }

    // Auto-indent on Enter after colon
    if (e.key === 'Enter') {
      const start = e.target.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop();
      const match = currentLine.match(/^(\s*)/);
      let indent = match ? match[1] : '';

      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const end = e.target.selectionEnd;
        setCode(code.substring(0, start) + '\n' + indent + code.substring(end));
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1 + indent.length;
          }
        }, 0);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setOutput('');
    setErrorInfo(null);
    setInputPrompt(null);
    setIsRunning(true);

    const startTime = performance.now();

    runPythonCode({
      code,
      timeoutMs: 8000,
      onOutput: (text) => {
        setOutput((prev) => prev + text);
      },
      onInputRequired: (promptText, resolve) => {
        setInputPrompt(promptText || 'ورودی: ');
        inputCallbackRef.current = resolve;
      },
      onFinished: () => {
        const elapsed = Math.round(performance.now() - startTime);
        setIsRunning(false);
        setOutput((prev) => prev + `\n\n[پایان اجرای برنامه در ${elapsed} میلی‌ثانیه]`);
      },
      onError: (err) => {
        setIsRunning(false);
        setErrorInfo(err);
      }
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    setInputPrompt(null);
    setOutput((prev) => prev + '\n\n[اجرای برنامه توسط کاربر متوقف شد]');
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

  const handleClearOutput = () => {
    setOutput('');
    setErrorInfo(null);
  };

  const handleResetCode = () => {
    if (window.confirm('آیا مایلید کد ویرایشگر را به نمونه اولیه بازنشانی کنید؟')) {
      setCode(PRESET_EXAMPLES[0].code);
      setOutput('');
      setErrorInfo(null);
    }
  };

  // Line numbers calculation
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>بازگشت به درس</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                محیط تعاملی اجرای پایتون (Code Playground)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>اجرای کلاینت‌ساید (۱۰۰٪ آفلاین)</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  <span>اجرا با Ctrl + Enter</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset templates selector */}
          <select
            onChange={(e) => {
              const selected = PRESET_EXAMPLES.find((ex) => ex.name === e.target.value);
              if (selected) {
                setCode(selected.code);
                setOutput('');
                setErrorInfo(null);
              }
            }}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none rounded-xl px-3 py-2 outline-none font-medium cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>بارگذاری نمونه کد آماده...</option>
            {PRESET_EXAMPLES.map((ex) => (
              <option key={ex.name} value={ex.name}>
                {ex.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            title="کپی کردن کد"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetCode}
            title="بازنشانی کد"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isRunning ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>توقف (Stop)</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>اجرای کد (Run)</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
        {/* Code Editor Box */}
        <div className="flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-xs font-mono text-slate-400 mr-2">main.py</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="text-[11px] text-slate-500 font-sans">Tab = ۴ فاصله</span>
              <span>Python 3</span>
            </div>
          </div>

          <div className="relative flex-1 flex bg-slate-900 overflow-hidden">
            {/* Line Numbers */}
            <div className="select-none py-3 px-3 text-right font-mono text-xs text-slate-600 bg-slate-950/40 border-l border-slate-800/60 leading-6">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Code Textarea with Tab & Autoindent handling */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 w-full h-full p-3 font-mono text-sm text-emerald-300 bg-transparent resize-none outline-none leading-6 selection:bg-indigo-700 selection:text-white"
              style={{ direction: 'ltr', textAlign: 'left', tabSize: 4 }}
              placeholder="# کدهای پایتون خود را اینجا بنویسید..."
            />
          </div>
        </div>

        {/* Output Console / Terminal */}
        <div className="flex flex-col rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">کنسول خروجی (Interactive Terminal)</span>
            </div>
            <button
              onClick={handleClearOutput}
              title="پاک کردن کنسول"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 px-2.5 py-1 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک‌سازی</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-200 bg-slate-950 flex flex-col justify-between">
            <div>
              {output ? (
                <pre
                  className="whitespace-pre-wrap leading-6 text-emerald-400"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                >
                  {output}
                </pre>
              ) : !isRunning && !errorInfo ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-600 select-none text-center">
                  <Sparkles className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
                  <p className="text-xs font-sans">کد خود را بنویسید و دکمه «اجرای کد» را بزنید.</p>
                  <p className="text-[11px] font-sans text-slate-500 mt-1">
                    خروجی و تعاملات ورودی تابع ()input اینجا نمایش داده خواهند شد.
                  </p>
                </div>
              ) : null}

              {/* Error Explanation Card with Line Number indication */}
              {errorInfo && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-rose-300 font-sans">
                          {errorInfo.title}
                        </h4>
                        {errorInfo.lineNumber && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-mono">
                            خط شماره {errorInfo.lineNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-rose-200/90 leading-5 font-sans">
                        {errorInfo.description}
                      </p>
                      <pre className="mt-2 p-2 rounded-lg bg-black/50 text-[11px] text-rose-300 overflow-x-auto font-mono text-left" dir="ltr">
                        {errorInfo.raw}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Inline Input Prompt Dialog */}
            {inputPrompt && (
              <form
                onSubmit={handleInputSubmit}
                className="mt-4 p-3 bg-indigo-950/60 border border-indigo-700/60 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <span className="text-indigo-300 text-xs font-mono shrink-0" dir="ltr">
                  {inputPrompt}
                </span>
                <input
                  ref={inputFieldRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ورودی را تایپ کنید و Enter بزنید..."
                  className="flex-1 bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-400 font-mono"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shrink-0"
                >
                  ارسال
                </button>
              </form>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
