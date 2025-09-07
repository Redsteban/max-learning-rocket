import LearningModule from '../LearningModule';
import { Globe } from 'lucide-react';

const worldLessons = [
  {
    id: 'world-1',
    title: 'Continent Explorer',
    description: 'Travel to all 7 continents and discover amazing places!',
    completed: false,
    xp: 55,
    emoji: '🗺️'
  },
  {
    id: 'world-2',
    title: 'Country Collector',
    description: 'Learn about different countries and their cool facts!',
    completed: false,
    xp: 50,
    emoji: '🌍'
  },
  {
    id: 'world-3',
    title: 'Language Detective',
    description: 'Discover how to say hello in 10 languages!',
    completed: false,
    xp: 45,
    emoji: '👋'
  },
  {
    id: 'world-4',
    title: 'Food Around the World',
    description: 'Taste amazing foods from different cultures!',
    completed: false,
    xp: 40,
    emoji: '🍜'
  },
  {
    id: 'world-5',
    title: 'Festival Fun',
    description: 'Celebrate holidays and festivals from around the globe!',
    completed: false,
    xp: 50,
    emoji: '🎉'
  },
  {
    id: 'world-6',
    title: 'Famous Landmarks',
    description: 'Visit the most amazing places on Earth!',
    completed: false,
    xp: 60,
    emoji: '🗿'
  }
];

export default function WorldPage() {
  return (
    <LearningModule
      subject="World Explorer"
      icon={<Globe className="w-10 h-10" />}
      color="from-blue-400 to-cyan-500"
      lessons={worldLessons}
    />
  );
}