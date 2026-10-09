/**
 * Python Runner using local browser-based Skulpt engine
 * 100% self-contained, offline-capable, with interactive input support.
 */

// Persian error explanations mapping to help students learn effectively
export function explainPythonError(rawError) {
  const errStr = String(rawError || '');

  if (errStr.includes('IndentationError')) {
    return {
      title: 'خطای تورفتگی (IndentationError)',
      description: 'فاصله‌گذاری در ابتدای سطرها در پایتون حیاتی است. بررسی کنید که بلاک‌های کد داخل if یا توابع دقیقاً با ۴ فاصله (یا یک Tab یکدست) تورفتگی داشته باشند.',
      raw: errStr
    };
  }
  if (errStr.includes('SyntaxError')) {
    return {
      title: 'خطای نگارشی (SyntaxError)',
      description: 'دستور طبق قواعد پایتون نوشته نشده است. بررسی کنید که آیا دونقطه (:) انتهای دستورات شرطی را گذاشته‌اید؟ پرانتزها و کوتیشن‌ها به درستی بسته شده‌اند؟',
      raw: errStr
    };
  }
  if (errStr.includes('NameError')) {
    return {
      title: 'خطای نام متغیر یا تابع (NameError)',
      description: 'از متغیر یا تابعی استفاده شده که قبلاً تعریف نشده است یا در املای حروف کوچک و بزرگ آن اشتباهی رخ داده است (پایتون به حروف حساس است).',
      raw: errStr
    };
  }
  if (errStr.includes('TypeError')) {
    return {
      title: 'خطای نوع داده (TypeError)',
      description: 'عملیاتی روی نوع داده نامناسب انجام شده است (مثلاً جمع یک رشته با یک عدد بدون تبدیل نوع با int یا str).',
      raw: errStr
    };
  }
  if (errStr.includes('ValueError')) {
    return {
      title: 'خطای مقدار نامعتبر (ValueError)',
      description: 'مقدار ورودی برای این تبدیل مناسب نیست؛ به عنوان مثال تلاش برای تبدیل یک کلمه متنی به عدد با تابع int().',
      raw: errStr
    };
  }
  if (errStr.includes('ZeroDivisionError')) {
    return {
      title: 'خطای تقسیم بر صفر (ZeroDivisionError)',
      description: 'در ریاضیات و پایتون تقسیم هر عدد بر صفر ناممکن و تعریف‌نشده است.',
      raw: errStr
    };
  }

  return {
    title: 'خطای زمان اجرا (Runtime Error)',
    description: 'خطایی در هنگام اجرای کد رخ داده است. لطفاً متن خطا را بررسی فرمایید.',
    raw: errStr
  };
}

export function runPythonCode({
  code,
  onOutput,
  onInputRequired,
  onFinished,
  onError
}) {
  const Sk = window.Sk;

  if (!Sk) {
    if (onError) onError('موتور مفسر پایتون بارگذاری نشده است. لطفاً صفحه را تازه‌سازی فرمایید.');
    return;
  }

  try {
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
        return new Promise((resolve) => {
          if (onInputRequired) {
            onInputRequired(promptText, (userInput) => {
              // Echo user's typed input with a newline
              if (onOutput) onOutput(userInput + '\n');
              resolve(userInput);
            });
          } else {
            const result = window.prompt(promptText || 'لطفاً مقدار ورودی را وارد کنید:') || '';
            if (onOutput) onOutput(result + '\n');
            resolve(result);
          }
        });
      },
      inputfunTakesPrompt: true,
      __future__: futureFlags
    });

    const promise = Sk.misceval.asyncToPromise(() =>
      Sk.importMainWithBody('<stdin>', false, code, true)
    );

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
