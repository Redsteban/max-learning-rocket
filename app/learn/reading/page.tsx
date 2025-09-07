import LearningModule from '../LearningModule';
import { BookOpen } from 'lucide-react';

const readingLessons = [
  {
    id: 'read-1',
    title: 'Speed Reader',
    description: 'Practice reading faster while understanding everything!',
    completed: false,
    xp: 50,
    emoji: '📖'
  },
  {
    id: 'read-2',
    title: 'Word Detective',
    description: 'Find clues to understand new and tricky words!',
    completed: false,
    xp: 45,
    emoji: '🔍'
  },
  {
    id: 'read-3',
    title: 'Story Predictor',
    description: 'Guess what happens next in exciting stories!',
    completed: false,
    xp: 40,
    emoji: '🔮'
  },
  {
    id: 'read-4',
    title: 'Character Friend',
    description: 'Meet amazing characters and understand their feelings!',
    completed: false,
    xp: 50,
    emoji: '😊'
  },
  {
    id: 'read-5',
    title: 'Main Idea Master',
    description: 'Find the most important parts of any story!',
    completed: false,
    xp: 55,
    emoji: '💡'
  },
  {
    id: 'read-6',
    title: 'Reading Champion',
    description: 'Complete reading challenges and become a champion!',
    completed: false,
    xp: 60,
    emoji: '🏆'
  }
];

export default function ReadingPage() {
  return (
    <LearningModule
      subject="Reading Rainbow"
      icon={<BookOpen className="w-10 h-10" />}
      color="from-indigo-400 to-purple-500"
      lessons={readingLessons}
    />
  );
}