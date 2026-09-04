import { useCallback, useState } from 'react';
import { DATAMUSE_QUERIES, WORD_FILTERS, WORD_MODES } from '../data/wordModes';

export function useFetchWords() {
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const fetchWords = useCallback(async (mode = 'easy') => {
    setIsLoadingWords(true);
    const fallback = WORD_MODES[mode]?.words || WORD_MODES.easy.words;

    try {
      const res = await fetch(DATAMUSE_QUERIES[mode] || DATAMUSE_QUERIES.easy);
      const data = await res.json();
      const filterFn = WORD_FILTERS[mode] || WORD_FILTERS.easy;

      const goodWords = data
        .filter(w => {
          const freq = w.tags?.find(t => t.startsWith('f:'));
          const freqValue = freq ? parseFloat(freq.split(':')[1]) : 0;
          return filterFn(w.word, freqValue) && /^[a-z]+$/.test(w.word);
        })
        .map(w => w.word);

      const combined = [...new Set([...goodWords, ...fallback])];
      if (combined.length >= 2) {
        const shuffled = combined.sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled[1]];
      }
      throw new Error('Not enough words');
    } catch {
      const shuffled = [...fallback].sort(() => Math.random() - 0.5);
      return [shuffled[0], shuffled[1]];
    } finally {
      setIsLoadingWords(false);
    }
  }, []);

  return { isLoadingWords, fetchWords };
}
