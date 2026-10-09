import React, { createContext, useContext, useState, useEffect } from 'react';
import { allChapters, getTotalStats } from '../data';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('py_theme') || 'dark';
  });

  // Navigation state
  const [activeChapterId, setActiveChapterId] = useState('chapter-1');
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'quiz' | 'challenge' | 'playground'
  const [activeLessonId, setActiveLessonId] = useState('ch1-l1');
  const [activeChallengeId, setActiveChallengeId] = useState('c1-1');

  // Modals state
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Playground code state
  const [playgroundCode, setPlaygroundCode] = useState(
    '# به محیط تعاملی پایتون خوش آمدید!\n# کد خود را بنویسید و روی دکمه «اجرای کد» کلیک کنید.\n\nname = "دانشجو"\nprint(f"سلام {name}! پایتون را با لذت یاد بگیر.")\n'
  );

  // Student progress in LocalStorage
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('py_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('py_quiz_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('py_completed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync theme
  useEffect(() => {
    localStorage.setItem('py_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync progress
  useEffect(() => {
    localStorage.setItem('py_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('py_quiz_answers', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  useEffect(() => {
    localStorage.setItem('py_completed_challenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const markLessonComplete = (lessonId) => {
    setCompletedLessons((prev) => {
      if (!prev.includes(lessonId)) {
        return [...prev, lessonId];
      }
      return prev;
    });
  };

  const recordQuizAnswer = (quizId, optionIndex, isCorrect) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [quizId]: { optionIndex, isCorrect }
    }));
  };

  const markChallengeComplete = (challengeId) => {
    setCompletedChallenges((prev) => {
      if (!prev.includes(challengeId)) {
        return [...prev, challengeId];
      }
      return prev;
    });
  };

  const openPlaygroundWithCode = (code) => {
    setPlaygroundCode(code);
    setActiveTab('playground');
  };

  // Calculate overall and chapter-specific progress
  const getOverallProgress = () => {
    const stats = getTotalStats();
    const totalItems = stats.totalLessons + stats.totalQuizzes + stats.totalChallenges;
    const completedItems =
      completedLessons.length +
      Object.keys(quizAnswers).length +
      completedChallenges.length;

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getChapterProgress = (chapterId) => {
    const ch = allChapters.find((c) => c.id === chapterId);
    if (!ch) return 0;

    const total = ch.lessons.length + ch.quizzes.length + ch.challenges.length;
    const completedL = ch.lessons.filter((l) => completedLessons.includes(l.id)).length;
    const completedQ = ch.quizzes.filter((q) => quizAnswers[q.id] !== undefined).length;
    const completedC = ch.challenges.filter((c) => completedChallenges.includes(c.id)).length;

    return total > 0 ? Math.round(((completedL + completedQ + completedC) / total) * 100) : 0;
  };

  const resetAllProgress = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام پیشرفت و نتایج ثبت‌شده را بازنشانی کنید؟')) {
      setCompletedLessons([]);
      setQuizAnswers({});
      setCompletedChallenges([]);
      localStorage.removeItem('py_completed_lessons');
      localStorage.removeItem('py_quiz_answers');
      localStorage.removeItem('py_completed_challenges');
    }
  };

  const currentChapter = allChapters.find((c) => c.id === activeChapterId) || allChapters[0];
  const currentLesson =
    currentChapter.lessons.find((l) => l.id === activeLessonId) || currentChapter.lessons[0];

  return (
    <CourseContext.Provider
      value={{
        theme,
        toggleTheme,
        activeChapterId,
        setActiveChapterId,
        activeTab,
        setActiveTab,
        activeLessonId,
        setActiveLessonId,
        activeChallengeId,
        setActiveChallengeId,
        currentChapter,
        currentLesson,
        playgroundCode,
        setPlaygroundCode,
        openPlaygroundWithCode,
        completedLessons,
        markLessonComplete,
        quizAnswers,
        recordQuizAnswer,
        completedChallenges,
        markChallengeComplete,
        getOverallProgress,
        getChapterProgress,
        resetAllProgress,
        isCheatSheetOpen,
        setIsCheatSheetOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCertificateOpen,
        setIsCertificateOpen
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
}
