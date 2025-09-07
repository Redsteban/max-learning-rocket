import LearningModule from '../LearningModule';
import { Calculator } from 'lucide-react';

const mathLessons = [
  {
    id: 'math-1',
    title: 'Number Ninjas',
    description: 'Master addition and subtraction like a ninja!',
    completed: false,
    xp: 50,
    emoji: '🥷'
  },
  {
    id: 'math-2',
    title: 'Multiplication Magic',
    description: 'Learn cool tricks to multiply numbers fast!',
    completed: false,
    xp: 60,
    emoji: '✨'
  },
  {
    id: 'math-3',
    title: 'Fraction Fun',
    description: 'Slice pizzas and share candy to learn fractions!',
    completed: false,
    xp: 55,
    emoji: '🍕'
  },
  {
    id: 'math-4',
    title: 'Shape Detective',
    description: 'Find shapes everywhere and solve shape mysteries!',
    completed: false,
    xp: 45,
    emoji: '🔺'
  },
  {
    id: 'math-5',
    title: 'Money Master',
    description: 'Learn to count money and make smart purchases!',
    completed: false,
    xp: 65,
    emoji: '💰'
  },
  {
    id: 'math-6',
    title: 'Time Traveler',
    description: 'Master telling time and solving time puzzles!',
    completed: false,
    xp: 50,
    emoji: '⏰'
  }
];

export default function MathPage() {
  return (
    <LearningModule
      subject="Math Wizard"
      icon={<Calculator className="w-10 h-10" />}
      color="from-purple-400 to-pink-500"
      lessons={mathLessons}
    />
  );
}