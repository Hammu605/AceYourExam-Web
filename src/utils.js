export function normalizeMakerXPath(path) {
  if (!path) return '';
  return path
    .trim()
    .replace(/[\\/]+/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function extractQuestionText(q, lang = 'English') {
  if (!q) return '';
  const isHindi = lang.toLowerCase().includes('hi');

  if (q.textByLang && typeof q.textByLang === 'object') {
    const key = Object.keys(q.textByLang).find(k => 
      isHindi ? k.toLowerCase().includes('hi') : k.toLowerCase().includes('en')
    );
    if (key && q.textByLang[key]) return q.textByLang[key];
    const firstVal = Object.values(q.textByLang)[0];
    if (firstVal) return firstVal;
  }

  if (isHindi && q.questionHindi) return q.questionHindi;
  if (isHindi && q.hindiQuestion) return q.hindiQuestion;

  return q.question || q.text || q.questionText || q.title || '';
}

export function extractQuestionOptions(q, lang = 'English') {
  if (!q) return [];
  const isHindi = lang.toLowerCase().includes('hi');

  if (q.optionsByLang && typeof q.optionsByLang === 'object') {
    const key = Object.keys(q.optionsByLang).find(k => 
      isHindi ? k.toLowerCase().includes('hi') : k.toLowerCase().includes('en')
    );
    if (key && Array.isArray(q.optionsByLang[key]) && q.optionsByLang[key].length > 0) {
      return q.optionsByLang[key];
    }
  }

  if (isHindi && Array.isArray(q.optionsHindi) && q.optionsHindi.length > 0) {
    return q.optionsHindi;
  }

  if (Array.isArray(q.options)) return q.options;
  if (Array.isArray(q.choices)) return q.choices;
  if (Array.isArray(q.answers)) return q.answers;

  return ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
}

export function extractQuestionExplanation(q, lang = 'English') {
  if (!q) return '';
  const isHindi = lang.toLowerCase().includes('hi');

  if (q.explanationByLang && typeof q.explanationByLang === 'object') {
    const key = Object.keys(q.explanationByLang).find(k => 
      isHindi ? k.toLowerCase().includes('hi') : k.toLowerCase().includes('en')
    );
    if (key && q.explanationByLang[key]) return q.explanationByLang[key];
  }

  if (isHindi && q.explanationHindi) return q.explanationHindi;
  return q.explanation || q.solution || q.desc || '';
}

export function extractCorrectOptionIndex(q) {
  if (!q) return 0;
  if (typeof q.correctOptionIndex === 'number') return q.correctOptionIndex;
  if (typeof q.correctOption === 'number') return q.correctOption;
  if (typeof q.correctAnswerIndex === 'number') return q.correctAnswerIndex;

  if (typeof q.correctOption === 'string') {
    const trimmed = q.correctOption.trim().toUpperCase();
    if (trimmed === 'A' || trimmed === '1') return 0;
    if (trimmed === 'B' || trimmed === '2') return 1;
    if (trimmed === 'C' || trimmed === '3') return 2;
    if (trimmed === 'D' || trimmed === '4') return 3;
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed)) return parsed > 0 ? parsed - 1 : 0;
  }

  if (typeof q.answer === 'number') return q.answer > 0 ? q.answer - 1 : 0;
  if (typeof q.answer === 'string') {
    const trimmed = q.answer.trim().toUpperCase();
    if (trimmed === 'A') return 0;
    if (trimmed === 'B') return 1;
    if (trimmed === 'C') return 2;
    if (trimmed === 'D') return 3;
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed)) return parsed > 0 ? parsed - 1 : 0;
  }

  return 0;
}
