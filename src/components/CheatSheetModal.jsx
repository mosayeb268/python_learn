import React, { useState } from 'react';
import { X, Copy, Check, FileText, Search } from 'lucide-react';
import { cheatSheetData } from '../data';
import { useCourse } from '../context/CourseContext';

export default function CheatSheetModal() {
  const { isCheatSheetOpen, setIsCheatSheetOpen } = useCourse();
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  if (!isCheatSheetOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredCategories = cheatSheetData.map((category) => {
    const matchingItems = category.items.filter(
      (item) =>
        item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        item.syntax.toLowerCase().includes(filterQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(filterQuery.toLowerCase())
    );
    return {
      ...category,
      items: matchingItems
    };
  }).filter((category) => category.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تقلب‌نامه و مرجع سریع فصول ۱ تا ۳
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                فرمول‌ها، عملگرها، توابع و قالب‌بندی‌های پرکاربرد پایتون
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheatSheetOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="فیلتر کردن دستورات (مثال: print, if, and, %)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {filteredCategories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {cat.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <button
                          onClick={() => handleCopy(item.syntax)}
                          title="کپی قطعه کد"
                          className="text-slate-400 hover:text-amber-500 transition"
                        >
                          {copiedText === item.syntax ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-5">
                        {item.desc}
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <code
                        className="font-mono text-xs text-emerald-400 block whitespace-pre-wrap"
                        dir="ltr"
                      >
                        {item.syntax}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              موردی منطبق با جستجوی شما یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
