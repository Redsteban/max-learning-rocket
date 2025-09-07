import LearningModule from '../LearningModule';
import { DollarSign } from 'lucide-react';

const moneyLessons = [
  {
    id: 'money-1',
    title: 'Coin Collector',
    description: 'Learn about pennies, nickels, dimes, and quarters!',
    completed: false,
    xp: 45,
    emoji: '🪙'
  },
  {
    id: 'money-2',
    title: 'Dollar Detective',
    description: 'Master counting dollars and making change!',
    completed: false,
    xp: 50,
    emoji: '💵'
  },
  {
    id: 'money-3',
    title: 'Store Manager',
    description: 'Run your own store and practice buying and selling!',
    completed: false,
    xp: 60,
    emoji: '🏪'
  },
  {
    id: 'money-4',
    title: 'Savings Superstar',
    description: 'Learn how to save money for things you want!',
    completed: false,
    xp: 55,
    emoji: '🐷'
  },
  {
    id: 'money-5',
    title: 'Smart Shopper',
    description: 'Compare prices and find the best deals!',
    completed: false,
    xp: 50,
    emoji: '🛒'
  },
  {
    id: 'money-6',
    title: 'Earning Explorer',
    description: 'Discover different ways people earn money!',
    completed: false,
    xp: 45,
    emoji: '💼'
  }
];

export default function MoneyPage() {
  return (
    <LearningModule
      subject="Money Smart"
      icon={<DollarSign className="w-10 h-10" />}
      color="from-yellow-400 to-green-500"
      lessons={moneyLessons}
    />
  );
}