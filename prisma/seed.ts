import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create achievements
  const achievements = [
    {
      name: 'First Day Hero',
      description: 'Complete your first day of learning!',
      icon: '🌟',
      category: 'special',
      requirement: JSON.stringify({ type: 'firstDay', value: 1 }),
      xpReward: 50,
    },
    {
      name: 'Week Warrior',
      description: 'Complete 5 days in a row',
      icon: '⚔️',
      category: 'streak',
      requirement: JSON.stringify({ type: 'streak', value: 5 }),
      xpReward: 100,
    },
    {
      name: 'Month Master',
      description: 'Complete 20 days in a row',
      icon: '👑',
      category: 'streak',
      requirement: JSON.stringify({ type: 'streak', value: 20 }),
      xpReward: 250,
    },
    {
      name: 'Century Champion',
      description: 'Reach a 100-day streak!',
      icon: '💯',
      category: 'streak',
      requirement: JSON.stringify({ type: 'streak', value: 100 }),
      xpReward: 1000,
    },
    {
      name: 'XP Rookie',
      description: 'Earn your first 100 XP',
      icon: '🎯',
      category: 'xp',
      requirement: JSON.stringify({ type: 'xp', value: 100 }),
      xpReward: 25,
    },
    {
      name: 'XP Champion',
      description: 'Earn 1000 XP',
      icon: '🏆',
      category: 'xp',
      requirement: JSON.stringify({ type: 'xp', value: 1000 }),
      xpReward: 100,
    },
    {
      name: 'XP Legend',
      description: 'Earn 5000 XP',
      icon: '🌈',
      category: 'xp',
      requirement: JSON.stringify({ type: 'xp', value: 5000 }),
      xpReward: 500,
    },
    {
      name: 'Science Star',
      description: 'Complete 10 science lessons',
      icon: '🔬',
      category: 'subject',
      requirement: JSON.stringify({ type: 'moduleLessons', module: 'science', value: 10 }),
      xpReward: 50,
    },
    {
      name: 'Math Wizard',
      description: 'Complete 10 math lessons',
      icon: '🧮',
      category: 'subject',
      requirement: JSON.stringify({ type: 'moduleLessons', module: 'math', value: 10 }),
      xpReward: 50,
    },
    {
      name: 'Story Teller',
      description: 'Complete 10 story lessons',
      icon: '📚',
      category: 'subject',
      requirement: JSON.stringify({ type: 'moduleLessons', module: 'stories', value: 10 }),
      xpReward: 50,
    },
    {
      name: 'World Explorer',
      description: 'Complete 10 world lessons',
      icon: '🌍',
      category: 'subject',
      requirement: JSON.stringify({ type: 'moduleLessons', module: 'world', value: 10 }),
      xpReward: 50,
    },
    {
      name: 'Business Builder',
      description: 'Complete 10 entrepreneur lessons',
      icon: '💼',
      category: 'subject',
      requirement: JSON.stringify({ type: 'moduleLessons', module: 'entrepreneur', value: 10 }),
      xpReward: 50,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Achievements created');

  // Create sample knowledge items
  const knowledgeItems = [
    // Science
    {
      moduleId: 'science',
      topic: 'States of Matter',
      subtopic: 'Solids, Liquids, and Gases',
      difficulty: 'easy' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Everything around us is made of matter! Matter comes in three main forms: solid (like ice), liquid (like water), and gas (like steam).',
        examples: ['Ice cube → solid', 'Water → liquid', 'Steam → gas'],
        funFact: 'Did you know? The same water can be all three states! Ice melts into water, and water can turn into steam!',
        activity: 'Find 3 solids, 3 liquids, and identify 1 gas in your home.',
        localConnection: 'The ocean water around Victoria is liquid, but in winter, puddles can freeze into solid ice!',
      }),
      tags: JSON.stringify(['science', 'matter', 'grade4', 'bc-curriculum']),
    },
    {
      moduleId: 'science',
      topic: 'Local Wildlife',
      subtopic: 'Pacific Northwest Animals',
      difficulty: 'medium' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Victoria and BC are home to amazing wildlife! From the ocean to the forests, animals have adapted to live here.',
        examples: ['Orcas in the ocean', 'Eagles in the sky', 'Deer in the forests'],
        funFact: 'A group of orcas is called a pod, and some pods live year-round near Victoria!',
        activity: 'Create a Pacific Northwest animal fact card with a drawing and 3 facts.',
        localConnection: 'You might see seals at Fishermans Wharf and herons at Beacon Hill Park!',
      }),
      tags: JSON.stringify(['science', 'animals', 'local', 'grade4']),
    },
    // Math
    {
      moduleId: 'math',
      topic: 'Multiplication',
      subtopic: 'Times Tables to 10',
      difficulty: 'easy' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Multiplication is repeated addition. 3×4 means adding 3 four times: 3+3+3+3=12',
        examples: ['2×5 = 10', '3×3 = 9', '4×4 = 16'],
        funFact: 'To multiply by 9 with your fingers: Hold up 10 fingers, fold down the number you\'re multiplying. The fingers on the left are tens, right are ones!',
        activity: 'Create a story problem using multiplication.',
        localConnection: 'If a BC Ferry makes 3 trips a day for 5 days, how many trips total? 3×5=15!',
      }),
      tags: JSON.stringify(['math', 'multiplication', 'grade4']),
    },
    {
      moduleId: 'math',
      topic: 'Fractions',
      subtopic: 'Halves, Quarters, and Thirds',
      difficulty: 'medium' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Fractions are parts of a whole. If you cut a pizza into 4 equal pieces, each piece is 1/4 (one quarter).',
        examples: ['1/2 = half', '1/4 = quarter', '1/3 = third'],
        funFact: 'Money uses fractions! A quarter (25¢) is 1/4 of a dollar!',
        activity: 'Draw a pizza and show how to divide it into halves, thirds, and quarters.',
        localConnection: 'At the Victoria Public Market, vendors might sell half or quarter portions!',
      }),
      tags: JSON.stringify(['math', 'fractions', 'grade4']),
    },
    // Stories
    {
      moduleId: 'stories',
      topic: 'Story Elements',
      subtopic: 'Characters, Setting, and Plot',
      difficulty: 'easy' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Every story has three main parts: characters (who), setting (where and when), and plot (what happens).',
        examples: ['Characters: heroes, villains, friends', 'Setting: castle, space, school', 'Plot: the adventure or problem'],
        funFact: 'The Harry Potter books have over 700 characters!',
        activity: 'Write a short story with a character, setting, and simple plot.',
        localConnection: 'Emily Carr, a famous Victoria artist, wrote stories about her adventures!',
      }),
      tags: JSON.stringify(['stories', 'writing', 'grade4']),
    },
    // World
    {
      moduleId: 'world',
      topic: 'Canadian Geography',
      subtopic: 'Provinces and Territories',
      difficulty: 'medium' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Canada has 10 provinces and 3 territories. We live in British Columbia, on the west coast!',
        examples: ['Provinces: BC, Alberta, Ontario...', 'Territories: Yukon, NWT, Nunavut'],
        funFact: 'Canada is the second-largest country in the world!',
        activity: 'Color a map of Canada and label BC and its neighbors.',
        localConnection: 'Victoria is the capital city of British Columbia!',
      }),
      tags: JSON.stringify(['world', 'geography', 'canada', 'grade4']),
    },
    // Entrepreneur
    {
      moduleId: 'entrepreneur',
      topic: 'Money Basics',
      subtopic: 'Earning and Saving',
      difficulty: 'easy' as const,
      gradeLevel: 4,
      content: JSON.stringify({
        explanation: 'Money is earned by working or selling things. Saving means keeping some money for later instead of spending it all.',
        examples: ['Earning: allowance, lemonade stand', 'Saving: piggy bank, savings account'],
        funFact: 'The first piggy banks were made from clay called "pygg"!',
        activity: 'Plan a small business idea and figure out costs and prices.',
        localConnection: 'Many kids in Victoria sell lemonade or crafts at local markets!',
      }),
      tags: JSON.stringify(['entrepreneur', 'money', 'grade4']),
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.upsert({
      where: {
        id: `${item.moduleId}_${item.topic}`.replace(/\s+/g, '_').toLowerCase(),
      },
      update: item,
      create: {
        ...item,
        id: `${item.moduleId}_${item.topic}`.replace(/\s+/g, '_').toLowerCase(),
      },
    });
  }

  console.log('✅ Knowledge items created');

  // Create sample lessons
  const lessons = [
    {
      moduleId: 'science',
      title: 'Exploring States of Matter',
      description: 'Learn about solids, liquids, and gases through fun experiments!',
      type: 'interactive',
      difficulty: 'easy',
      estimatedTime: 15,
      xpReward: 30,
      content: JSON.stringify({
        introduction: 'Today we will explore the three states of matter!',
        activities: ['Ice cube melting experiment', 'Identify matter around you', 'Draw the water cycle'],
        quiz: ['What are the three states of matter?', 'Give an example of each state'],
      }),
    },
    {
      moduleId: 'math',
      title: 'Multiplication Adventure',
      description: 'Master your times tables with fun games!',
      type: 'quiz',
      difficulty: 'medium',
      estimatedTime: 20,
      xpReward: 35,
      content: JSON.stringify({
        introduction: 'Time to practice multiplication!',
        problems: ['2×3=?', '4×5=?', '7×8=?'],
        games: ['Times table race', 'Multiplication bingo'],
      }),
    },
    {
      moduleId: 'stories',
      title: 'Create Your Own Adventure',
      description: 'Write an exciting story with characters and plot!',
      type: 'project',
      difficulty: 'medium',
      estimatedTime: 30,
      xpReward: 40,
      content: JSON.stringify({
        introduction: 'Time to become an author!',
        steps: ['Choose your character', 'Pick a setting', 'Create a problem', 'Write the solution'],
        prompts: ['A dragon who cannot breathe fire', 'A magical pencil', 'A talking animal'],
      }),
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: lesson,
    });
  }

  console.log('✅ Lessons created');

  // Create demo users if they don't exist
  const maxUser = await prisma.user.upsert({
    where: { username: 'max' },
    update: {},
    create: {
      username: 'max',
      name: 'Max',
      role: 'child',
      grade: 4,
      avatar: '🦸',
      picturePassword: JSON.stringify(['🌟', '🚀', '🌈', '🎮']),
      progress: {
        create: {
          level: 1,
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { username: 'parent' },
    update: {},
    create: {
      username: 'parent',
      name: 'Parent',
      role: 'parent',
      passwordHash: bcrypt.hashSync('parent123', 10),
    },
  });

  console.log('✅ Demo users created');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });