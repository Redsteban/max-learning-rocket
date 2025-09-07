import LearningModule from '../LearningModule';
import { BookOpen } from 'lucide-react';

const storyLessons = [
  {
    id: 'story-1',
    title: 'Create Your Hero',
    description: 'Design an amazing hero for your own adventure story!',
    completed: false,
    xp: 50,
    emoji: '🦸'
  },
  {
    id: 'story-2',
    title: 'Magic Words',
    description: 'Learn powerful words to make your stories come alive!',
    completed: false,
    xp: 45,
    emoji: '✏️'
  },
  {
    id: 'story-3',
    title: 'Story Starter',
    description: 'Use fun prompts to begin incredible tales!',
    completed: false,
    xp: 40,
    emoji: '📚'
  },
  {
    id: 'story-4',
    title: 'Picture Stories',
    description: 'Create stories using pictures and imagination!',
    completed: false,
    xp: 55,
    emoji: '🎨'
  },
  {
    id: 'story-5',
    title: 'Rhyme Time',
    description: 'Write fun poems and rhyming stories!',
    completed: false,
    xp: 50,
    emoji: '🎵'
  },
  {
    id: 'story-6',
    title: 'Comic Creator',
    description: 'Make your own comic book adventure!',
    completed: false,
    xp: 60,
    emoji: '💥'
  }
];

export default function StoriesPage() {
  return (
    <LearningModule
      subject="Story Creator"
      icon={<BookOpen className="w-10 h-10" />}
      color="from-orange-400 to-red-500"
      lessons={storyLessons}
    />
  );
}