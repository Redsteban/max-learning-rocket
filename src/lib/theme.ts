// ==========================================
// MAX'S LEARNING ADVENTURE - THEME CONFIGURATION
// ==========================================

export const theme = {
  // Color Palette - Bright and Fun for Kids
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Main primary
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Main secondary
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    success: {
      light: '#4ade80',
      main: '#22c55e',
      dark: '#16a34a',
    },
    warning: {
      light: '#fde047',
      main: '#fbbf24',
      dark: '#f59e0b',
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#60a5fa',
      main: '#3b82f6',
      dark: '#2563eb',
    },
    // Game-specific colors
    xp: '#fbbf24', // Gold
    streak: '#f97316', // Orange
    achievement: '#a855f7', // Purple
    badge: '#ec4899', // Pink
    level: '#06b6d4', // Cyan
  },

  // Module Color Schemes
  modules: {
    science: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      gradient: 'from-blue-400 to-cyan-400',
      icon: '🔬',
      bgImage: '/images/science-bg.jpg',
    },
    math: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      gradient: 'from-purple-400 to-indigo-400',
      icon: '🧮',
      bgImage: '/images/math-bg.jpg',
    },
    stories: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      gradient: 'from-pink-400 to-rose-400',
      icon: '📚',
      bgImage: '/images/stories-bg.jpg',
    },
    world: {
      primary: '#10b981',
      secondary: '#34d399',
      gradient: 'from-green-400 to-emerald-400',
      icon: '🌍',
      bgImage: '/images/world-bg.jpg',
    },
    entrepreneur: {
      primary: '#f97316',
      secondary: '#ef4444',
      gradient: 'from-orange-400 to-red-400',
      icon: '💼',
      bgImage: '/images/entrepreneur-bg.jpg',
    },
  },

  // Typography
  fonts: {
    display: "'Fredoka', 'Comic Sans MS', cursive",
    body: "'Nunito', 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  // Font Sizes - Larger for young readers
  fontSize: {
    xs: '14px',
    sm: '16px',
    base: '18px',
    lg: '20px',
    xl: '24px',
    '2xl': '28px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '64px',
  },

  // Spacing - Touch-friendly
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    touch: '3rem', // Minimum touch target
  },

  // Border Radius - Playful rounded corners
  borderRadius: {
    none: '0',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '3rem',
    full: '9999px',
  },

  // Shadows - Soft and inviting
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.16)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.20)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },

  // Animations
  animations: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
      slowest: '1000ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Breakpoints
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  // Game Elements
  game: {
    xpPerActivity: 10,
    xpPerAchievement: 50,
    xpPerStreak: 5,
    streakBonus: {
      3: 1.1,
      7: 1.25,
      14: 1.5,
      30: 2,
    },
    levels: [
      { level: 1, minXP: 0, title: 'Explorer' },
      { level: 2, minXP: 100, title: 'Adventurer' },
      { level: 3, minXP: 300, title: 'Discoverer' },
      { level: 4, minXP: 600, title: 'Scholar' },
      { level: 5, minXP: 1000, title: 'Researcher' },
      { level: 6, minXP: 1500, title: 'Expert' },
      { level: 7, minXP: 2500, title: 'Master' },
      { level: 8, minXP: 4000, title: 'Sage' },
      { level: 9, minXP: 6000, title: 'Legend' },
      { level: 10, minXP: 10000, title: 'Grand Master' },
    ],
  },

  // Sound Effects
  sounds: {
    achievement: '/sounds/achievement.mp3',
    levelUp: '/sounds/level-up.mp3',
    correct: '/sounds/correct.mp3',
    incorrect: '/sounds/incorrect.mp3',
    click: '/sounds/click.mp3',
    whoosh: '/sounds/whoosh.mp3',
    pop: '/sounds/pop.mp3',
    coin: '/sounds/coin.mp3',
    streak: '/sounds/streak.mp3',
    complete: '/sounds/complete.mp3',
  },

  // Achievement Icons
  achievementIcons: {
    firstDay: '🌟',
    weekWarrior: '⚔️',
    monthMaster: '👑',
    centuryChampion: '💯',
    scienceStar: '🔬',
    mathWizard: '🧮',
    storyTeller: '📚',
    worldExplorer: '🌍',
    businessBuilder: '💼',
    earlyBird: '🌅',
    nightOwl: '🦉',
    speedDemon: '⚡',
    perfectScore: '💎',
    helpingHand: '🤝',
  },

  // Avatar Options for Kids
  avatars: [
    { id: 'superhero', emoji: '🦸', name: 'Super Hero' },
    { id: 'ninja', emoji: '🥷', name: 'Ninja' },
    { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronaut' },
    { id: 'wizard', emoji: '🧙', name: 'Wizard' },
    { id: 'robot', emoji: '🤖', name: 'Robot' },
    { id: 'dinosaur', emoji: '🦕', name: 'Dinosaur' },
    { id: 'pirate', emoji: '🏴‍☠️', name: 'Pirate' },
    { id: 'knight', emoji: '⚔️', name: 'Knight' },
    { id: 'detective', emoji: '🕵️', name: 'Detective' },
    { id: 'artist', emoji: '🎨', name: 'Artist' },
  ],

  // Fun Facts Database Topics
  funFacts: {
    science: [
      'Did you know octopuses have three hearts?',
      'A group of flamingos is called a flamboyance!',
      'Bananas are berries, but strawberries aren\'t!',
    ],
    math: [
      'The word "hundred" comes from the old Norse word "hundrath", which means 120!',
      'Zero is the only number that can\'t be represented in Roman numerals.',
      'A jiffy is an actual unit of time: 1/100th of a second!',
    ],
    history: [
      'The Great Wall of China took over 2,000 years to build!',
      'Ancient Egyptians used slabs of stone as pillows.',
      'Vikings didn\'t actually wear horned helmets!',
    ],
    world: [
      'Russia has 11 time zones!',
      'Canada has more lakes than the rest of the world combined!',
      'There\'s a city called Rome on every continent!',
    ],
  },
};

// Helper function to get module theme
export const getModuleTheme = (moduleId: string) => {
  return theme.modules[moduleId as keyof typeof theme.modules] || theme.modules.science;
};

// Helper function to get level info
export const getLevelInfo = (xp: number) => {
  const level = theme.game.levels.findLast(l => xp >= l.minXP) || theme.game.levels[0];
  const nextLevel = theme.game.levels[theme.game.levels.findIndex(l => l === level) + 1];
  
  return {
    current: level,
    next: nextLevel,
    progress: nextLevel 
      ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100 
      : 100,
  };
};

// Helper function to play sound
export const playSound = (soundName: keyof typeof theme.sounds) => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(theme.sounds[soundName]);
    audio.play().catch(e => console.log('Sound play failed:', e));
  }
};

// Helper function to get random fun fact
export const getRandomFunFact = (category?: keyof typeof theme.funFacts) => {
  const facts = category 
    ? theme.funFacts[category]
    : Object.values(theme.funFacts).flat();
  
  return facts[Math.floor(Math.random() * facts.length)];
};

export default theme;