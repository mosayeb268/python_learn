import { chapter1Data } from './chapter1';
import { chapter2Data } from './chapter2';
import { chapter3Data } from './chapter3';
import { cheatSheetData } from './cheatSheetData';

export const allChapters = [chapter1Data, chapter2Data, chapter3Data];
export { chapter1Data, chapter2Data, chapter3Data, cheatSheetData };

export function getTotalStats() {
  const totalLessons = allChapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const totalQuizzes = allChapters.reduce((acc, ch) => acc + ch.quizzes.length, 0);
  const totalChallenges = allChapters.reduce((acc, ch) => acc + ch.challenges.length, 0);

  return {
    totalChapters: allChapters.length,
    totalLessons,
    totalQuizzes,
    totalChallenges
  };
}

export function searchCourse(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const results = [];

  allChapters.forEach((chapter) => {
    // Search in lessons
    chapter.lessons.forEach((lesson) => {
      const matchInTitle = lesson.title.toLowerCase().includes(q);
      const matchInSummary = lesson.summary.toLowerCase().includes(q);
      const matchInContent = lesson.content.toLowerCase().includes(q);

      if (matchInTitle || matchInSummary || matchInContent) {
        results.push({
          type: 'lesson',
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          itemId: lesson.id,
          title: lesson.title,
          snippet: lesson.summary
        });
      }
    });

    // Search in quizzes
    chapter.quizzes.forEach((quiz, index) => {
      if (quiz.question.toLowerCase().includes(q)) {
        results.push({
          type: 'quiz',
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          itemId: quiz.id,
          title: `آزمون فصل ${chapter.number} (سوال ${index + 1})`,
          snippet: quiz.question
        });
      }
    });

    // Search in challenges
    chapter.challenges.forEach((challenge) => {
      if (
        challenge.title.toLowerCase().includes(q) ||
        challenge.description.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'challenge',
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          itemId: challenge.id,
          title: challenge.title,
          snippet: challenge.description.slice(0, 100) + '...'
        });
      }
    });
  });

  return results;
}
