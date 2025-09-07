import LearningModule from '../LearningModule';
import { Microscope } from 'lucide-react';

const scienceLessons = [
  {
    id: 'sci-1',
    title: 'Amazing Animals',
    description: 'Learn about incredible creatures and their superpowers!',
    completed: false,
    xp: 50,
    emoji: '🦁'
  },
  {
    id: 'sci-2',
    title: 'Space Adventure',
    description: 'Explore planets, stars, and the mysteries of space!',
    completed: false,
    xp: 60,
    emoji: '🚀'
  },
  {
    id: 'sci-3',
    title: 'Weather Wonders',
    description: 'Discover how rain, snow, and storms are made!',
    completed: false,
    xp: 45,
    emoji: '⛈️'
  },
  {
    id: 'sci-4',
    title: 'Volcano Explosion',
    description: 'Learn about volcanoes and make your own eruption!',
    completed: false,
    xp: 70,
    emoji: '🌋'
  },
  {
    id: 'sci-5',
    title: 'Ocean Mysteries',
    description: 'Dive deep into the ocean and meet amazing sea creatures!',
    completed: false,
    xp: 55,
    emoji: '🐙'
  },
  {
    id: 'sci-6',
    title: 'Plant Power',
    description: 'Discover how plants grow and make their own food!',
    completed: false,
    xp: 40,
    emoji: '🌱'
  }
];

export default function SciencePage() {
  return (
    <LearningModule
      subject="Science Explorer"
      icon={<Microscope className="w-10 h-10" />}
      color="from-green-400 to-teal-500"
      lessons={scienceLessons}
    />
  );
}