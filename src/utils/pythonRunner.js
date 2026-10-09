/**
 * Enhanced Python Runner using local browser-based Skulpt engine
 * 100% self-contained, offline-capable.
 * Supports:
 * - Interactive input prompt dialogs
 * - Automated inputs queue for automated test cases (auto-grading)
 * - Infinite loop / Timeout protection (Sk.execLimit)
 * - Intelligent Persian error diagnostics with line number detection
 */

export function explainPythonError(rawError) {
  const errStr = String(rawError || '');

  // Extract line number if available (e.g. "on line 5")
  const lineMatch = errStr.match(/on line (\d+)/i) || errStr.match(/line (\d+)/i);
  const lineNumber = lineMatch ? lineMatch[1] : null;

  let title = 'خطای زمان اجرا (Runtime Error)';
  let description = 'خطایی در هنگام اجرای برنامه رخ داده است.';

  if (errStr.includes('TimeLimitError')) {
    title = 'خطای محدودیت زمان اجرا (TimeLimitError)';
    description = 'اجرای کد بیش از حد مجاز (حداکثر ۸ ثانیه) طول کشید. احتمالاً در برنامه یک حلقه بی‌نهایت یا محاسبه بسیار سنگین رخ داده است.';
  } else if (errStr.includes('IndentationError')) {
    title = 'خطای تورفتگی (IndentationError)';
    description = 'فاصله‌گذاری در ابتدای سطرها در پایتون حیاتی است. بررسی کنید که بلاک‌های کد داخل if یا توابع دقیقاً با ۴ فاصله (یا یک Tab یکدست) تورفتگی داشته باشند.';
  } else if (errStr.includes('SyntaxError')) {
    title = 'خطای نگارشی (SyntaxError)';
    description = 'دستور طبق قواعد پایتون نوشته نشده است. بررسی کنید: آیا دونقطه (:) انتهای دستورات شرطی را گذاشته‌اید؟ پرانتزها و کوتیشن‌ها به درستی بسته شده‌اند؟';
  } else if (errStr.includes('NameError')) {
    title = 'خطای متغیر یا تابع ناشناخته (NameError)';
    description = 'از متغیر یا تابعی استفاده شده که قبلاً تعریف نشده یا در املای حروف کوچک و بزرگ آن اشتباهی رخ داده است (پایتون به حروف حساس است).';
  } else if (errStr.includes('TypeError')) {
    title = 'خطای نوع داده (TypeError)';
    description = 'عملیاتی روی نوع داده نامناسب انجام شده است (مثلاً جمع یک رشته با یک عدد بدون تبدیل نوع با int یا str).';
  } else if (errStr.includes('ValueError')) {
    title = 'خطای مقدار نامعتبر (ValueError)';
    description = 'مقدار ورودی برای این تبدیل مناسب نیست؛ به عنوان مثال تلاش برای تبدیل یک کلمه متنی به عدد با تابع int().';
  } else if (errStr.includes('ZeroDivisionError')) {
    title = 'خطای تقسیم بر صفر (ZeroDivisionError)';
    description = 'در ریاضیات و پایتون تقسیم هر عدد بر صفر ناممکن و تعریف‌نشده است.';
  }

  return {
    title,
    description,
    lineNumber,
    raw: errStr
  };
}

export function runPythonCode({
  code,
  predefinedInputs = null,
  timeoutMs = 8000,
  onOutput,
  onInputRequired,
  onFinished,
  onError
}) {
  const Sk = window.Sk;

  if (!Sk) {
    if (onError) onError({
      title: 'موتور مفسر بارگذاری نشده است',
      description: 'کتابخانه Skulpt در مرورگر یافت نشد. لطفاً صفحه را تازه‌سازی (F5) فرمایید.',
      raw: 'Sk is undefined'
    });
    return;
  }

  try {
    // Clone or consume predefined inputs queue for automated test cases
    let inputQueue = predefinedInputs ? [...predefinedInputs] : null;

    // Timeout limit to prevent browser freeze on infinite loops
    Sk.execLimit = timeoutMs;

    const futureFlags =
      typeof Sk.python3 === 'object' && Sk.python3 !== null
        ? Sk.python3
        : {
            print_function: true,
            division: true,
            absolute_import: null,
            unicode_literals: true,
            python3: true,
            class_repr: true,
            inherit_from_object: true,
            super_args: true,
            octal_number_literal: true,
            bankers_rounding: true,
            python_version: true,
            dunder_round: true,
            exceptions: true,
            no_long_type: true,
            ceil_floor_int: true,
            silent_octal_literal: false
          };

    Sk.configure({
      output: (text) => {
        if (onOutput) onOutput(text);
      },
      read: (x) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
          throw new Error('فایل ماژول استاندارد یافت نشد: ' + x);
        }
        return Sk.builtinFiles['files'][x];
      },
      inputfun: (promptText) => {
        if (onOutput && promptText) {
          onOutput(promptText);
        }

        // If automated predefined inputs queue exists:
        if (inputQueue && inputQueue.length > 0) {
          const autoVal = inputQueue.shift();
          if (onOutput) onOutput(autoVal + '\n');
          return Promise.resolve(autoVal);
        }

        // Interactive user input prompt
        return new Promise((resolve) => {
          if (onInputRequired) {
            onInputRequired(promptText, (userInput) => {
              if (onOutput) onOutput(userInput + '\n');
              resolve(userInput);
            });
          } else {
            const result = window.prompt(promptText || 'مقدار ورودی را وارد کنید:') || '';
            if (onOutput) onOutput(result + '\n');
            resolve(result);
          }
        });
      },
      inputfunTakesPrompt: true,
      __future__: futureFlags
    });

    const promise = Sk.misceval.asyncToPromise(
      () => Sk.importMainWithBody('<stdin>', false, code, true),
      {
        '*': () => {
          // Check execution limit periodically
          if (Sk.execLimit && new Date().getTime() - startTime > Sk.execLimit) {
            throw new Sk.builtin.TimeLimitError('Program exceeded run time limit');
          }
        }
      }
    );

    const startTime = new Date().getTime();

    promise
      .then(() => {
        if (onFinished) onFinished();
      })
      .catch((err) => {
        const errorInfo = explainPythonError(err);
        if (onError) onError(errorInfo);
      });
  } catch (err) {
    const errorInfo = explainPythonError(err);
    if (onError) onError(errorInfo);
  }
}
