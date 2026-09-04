import { useEffect, useRef } from 'react';

export function useAutoSubmit({ timeLeft, gameState, playerId, inputWord, setInputWord, submitWord }) {
  const prevTimeLeftRef = useRef(timeLeft);
  const hasAutoSubmittedRef = useRef(false);

  useEffect(() => {
    if (gameState?.state === 'playing') {
      hasAutoSubmittedRef.current = false;
    }
  }, [gameState?.state]);

  useEffect(() => {
    const wasAboveZero = prevTimeLeftRef.current > 0;
    const isNowZero = timeLeft === 0;
    const isPlaying = gameState?.state === 'playing';
    const isSubmittingPlayer = playerId && gameState?.judgeId !== playerId;
    const hasWordTyped = inputWord.trim().length > 0;
    const notYetSubmitted = !gameState?.submissions?.[playerId];
    const hasNotAutoSubmitted = !hasAutoSubmittedRef.current;

    if (wasAboveZero && isNowZero && isPlaying && isSubmittingPlayer && hasWordTyped && notYetSubmitted && hasNotAutoSubmitted) {
      console.log('Auto-submitting word on timer end:', inputWord.trim());
      hasAutoSubmittedRef.current = true;
      submitWord(inputWord.trim());
      setInputWord('');
    }

    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, gameState?.state, gameState?.submissions, gameState?.judgeId, playerId, inputWord, submitWord, setInputWord]);
}
