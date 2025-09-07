/**
 * Jest Test Setup
 * Configuration for all test suites
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock Audio API for sound effects
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  volume: 1,
})) as any;

// Mock SpeechSynthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
} as any;

// Mock SpeechRecognition API
(global as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: jest.fn(),
  onerror: jest.fn(),
  onend: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock timers for animation testing
jest.useFakeTimers();

// Console error/warning suppression for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockClaudeResponse = (response: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  });
};

export const mockClaudeError = (error: string) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Custom matchers
expect.extend({
  toBeGrade4Appropriate(received: string) {
    const words = received.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const complexWords = words.filter(word => word.length > 10).length;
    
    const pass = avgWordLength < 6 && complexWords < 3;
    
    return {
      pass,
      message: () => pass
        ? `Expected text not to be Grade 4 appropriate`
        : `Expected text to be Grade 4 appropriate (avg word length: ${avgWordLength.toFixed(1)}, complex words: ${complexWords})`,
    };
  },
  
  toContainEducationalContent(received: string) {
    const educationalKeywords = [
      'learn', 'understand', 'explore', 'discover', 'practice',
      'try', 'think', 'solve', 'create', 'imagine'
    ];
    
    const lower = received.toLowerCase();
    const hasEducationalContent = educationalKeywords.some(keyword => lower.includes(keyword));
    
    return {
      pass: hasEducationalContent,
      message: () => hasEducationalContent
        ? `Expected text not to contain educational content`
        : `Expected text to contain educational content`,
    };
  },
});

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeGrade4Appropriate(): R;
      toContainEducationalContent(): R;
    }
  }
}