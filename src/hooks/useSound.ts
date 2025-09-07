'use client';

import { useCallback } from 'react';

export function useSound() {
  const sounds: Record<string, string> = {
    'send': '/sounds/send.mp3',
    'receive': '/sounds/receive.mp3',
    'xp-gain': '/sounds/xp.mp3',
    'achievement': '/sounds/achievement.mp3',
    'welcome': '/sounds/welcome.mp3',
    'voice-start': '/sounds/voice-start.mp3',
    'level-up': '/sounds/level-up.mp3',
    'correct': '/sounds/correct.mp3',
    'hint': '/sounds/hint.mp3',
    'complete': '/sounds/complete.mp3'
  };

  const playSound = useCallback((soundName: string) => {
    if (typeof window !== 'undefined' && sounds[soundName]) {
      const audio = new Audio(sounds[soundName]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound play failed:', e));
    }
  }, []);

  return { playSound };
}