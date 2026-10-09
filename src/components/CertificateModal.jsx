import React, { useState } from 'react';
import { Award, X, Printer, CheckCircle, Sparkles } from 'lucide-react';
import { useCourse } from '../context/CourseContext';

export default function CertificateModal({ isOpen, onClose }) {
  const { getOverallProgress, completedLessons, completedChallenges, quizAnswers } = useCourse();
  const [studentName, setStudentName] = useState('دانشجوی گرامی');
  const [isEditingName, setIsEditingName] = useState(false);

  if (!isOpen) return null;

  const progress = getOverallProgress();
  const currentDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Header bar (hidden in print) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              گواهی اتمام ۳ فصل اول کتاب آموزش جامع پایتون
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / ذخیره PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-amber-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative">
          {/* Decorative Corner Borders */}
          <div className="border-4 border-double border-amber-500/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-amber-400/30">
              <Sparkles className="w-12 h-12" />
            </div>

            {/* Emblem */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-6">
              <Award className="w-10 h-10" />
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              گواهی پایان دوره مبانی پایتون
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
              بر اساس فصول اول تا سوم کتاب آموزش جامع پایتون (تالیف مهندس عین‌الله جعفرنژاد قمی)
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              بدین‌وسیله گواهی می‌شود که:
            </p>

            {/* Editable student name */}
            <div className="my-3">
              {isEditingName ? (
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="text-lg sm:text-2xl font-black text-center text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 outline-none bg-transparent"
                />
              ) : (
                <h2
                  onClick={() => setIsEditingName(true)}
                  title="کلیک برای ویرایش نام"
                  className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline inline-block"
                >
                  {studentName} ✏️
                </h2>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-7 mt-4">
              با موفقیت تمامی دروس، تمرین‌های کدنویسی و آزمون‌های مفهومی سه‌گانه
              (مبانی و مفسر، متغیرها و عملگرها و ورودی/خروجی، و ساختارهای تصمیم‌گیری شرطی)
              را با امتیاز کل <span className="font-bold text-emerald-600 font-mono">{progress}٪</span> به پایان رسانده است.
            </p>

            {/* Verification Stats */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto my-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">دروس تکمیل‌شده</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                  {completedLessons.length} درس
                </span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">آزمون‌های تحلیلی</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                  {Object.keys(quizAnswers).length} سوال
                </span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">چالش‌های کدنویسی</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                  {completedChallenges.length} تمرین
                </span>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <div className="text-right">
                <span className="block font-bold text-slate-700 dark:text-slate-300">تاریخ ثبت و صدور:</span>
                <span>{currentDate}</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>اعتبار تاییدشده سامانه</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
