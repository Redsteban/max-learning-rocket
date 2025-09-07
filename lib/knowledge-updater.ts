import { prisma } from './database';

// Knowledge Update Service
// This service manages content updates and keeps the knowledge base fresh

interface ContentUpdate {
  moduleId: string;
  topic: string;
  content: any;
  source: 'curriculum' | 'wikipedia' | 'educational-api' | 'manual';
}

// Canadian Grade 4 Curriculum Topics (BC Curriculum)
export const CURRICULUM_TOPICS = {
  science: {
    'Physical Science': [
      'Properties of matter',
      'States of matter (solid, liquid, gas)',
      'Energy and its forms',
      'Light and sound',
      'Simple machines',
    ],
    'Life Science': [
      'Living vs non-living things',
      'Plant and animal adaptations',
      'Food chains and ecosystems',
      'Human body systems',
      'Local wildlife (Pacific Northwest)',
    ],
    'Earth and Space': [
      'Weather patterns',
      'Water cycle',
      'Rocks and minerals',
      'Solar system basics',
      'Day and night cycles',
    ],
  },
  math: {
    'Number Sense': [
      'Place value to 10,000',
      'Addition and subtraction to 10,000',
      'Multiplication facts to 10×10',
      'Introduction to division',
      'Fractions (halves, quarters, thirds)',
    ],
    'Patterns and Algebra': [
      'Number patterns',
      'Growing and shrinking patterns',
      'Simple equations',
      'Missing numbers',
    ],
    'Geometry': [
      'Lines and angles',
      '2D and 3D shapes',
      'Symmetry',
      'Area and perimeter',
    ],
    'Data and Probability': [
      'Collecting and organizing data',
      'Bar graphs and pictographs',
      'Simple probability',
    ],
  },
  social: {
    'Local History': [
      'Indigenous peoples of BC',
      'Victoria history',
      'BC gold rush',
      'Canadian symbols',
    ],
    'Geography': [
      'Maps and globes',
      'Continents and oceans',
      'Canadian provinces and territories',
      'Physical features of BC',
    ],
    'Citizenship': [
      'Rights and responsibilities',
      'Community helpers',
      'Environmental stewardship',
    ],
  },
  language: {
    'Reading': [
      'Comprehension strategies',
      'Story elements',
      'Main idea and details',
      'Making predictions',
    ],
    'Writing': [
      'Paragraph structure',
      'Narrative writing',
      'Descriptive writing',
      'Letter writing',
    ],
    'Speaking': [
      'Oral presentations',
      'Active listening',
      'Expressing opinions',
    ],
  },
};

// Fetch educational content from Wikipedia API (simplified, safe content)
export async function fetchWikipediaContent(topic: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Extract and simplify content for Grade 4 level
    const summary = data.extract;
    if (!summary) return null;
    
    // Simplify the text (basic implementation)
    const simplified = summary
      .split('. ')
      .slice(0, 3) // Take first 3 sentences
      .join('. ') + '.';
    
    return simplified;
  } catch (error) {
    console.error('Error fetching Wikipedia content:', error);
    return null;
  }
}

// Generate age-appropriate content based on curriculum
export async function generateCurriculumContent(
  moduleId: string,
  topic: string,
  subtopic: string
): Promise<ContentUpdate> {
  const content = {
    topic,
    subtopic,
    explanation: '',
    examples: [] as string[],
    funFact: '',
    activity: '',
    localConnection: '', // Victoria/BC specific content
  };

  // Generate content based on module and topic
  switch (moduleId) {
    case 'science':
      if (topic === 'Life Science' && subtopic === 'Local wildlife (Pacific Northwest)') {
        content.explanation = 'The Pacific Northwest is home to amazing animals like orcas, salmon, and bald eagles!';
        content.examples = [
          'Orcas (killer whales) swim in the waters around Victoria',
          'Salmon swim up rivers to lay their eggs',
          'Black bears live in the forests of BC',
        ];
        content.funFact = 'Did you know? A group of orcas is called a pod, and they can be seen from the shore in Victoria!';
        content.activity = 'Draw your favorite Pacific Northwest animal and write 3 facts about it.';
        content.localConnection = 'You can see orcas from the Inner Harbour in Victoria during summer!';
      }
      break;

    case 'math':
      if (topic === 'Number Sense' && subtopic === 'Multiplication facts to 10×10') {
        content.explanation = 'Multiplication is like adding the same number many times. For example, 3×4 means 3+3+3+3!';
        content.examples = [
          '2×5 = 10 (like 5+5)',
          '3×3 = 9 (like 3+3+3)',
          '4×4 = 16 (like 4+4+4+4)',
        ];
        content.funFact = 'Your fingers can help you with the 9 times table! Hold up 10 fingers and fold down the number you\'re multiplying by 9.';
        content.activity = 'Create a multiplication story: If you have 4 bags with 6 apples each, how many apples total?';
        content.localConnection = 'The BC Ferries fleet has 35 vessels. If each makes 2 trips, how many trips in total?';
      }
      break;

    case 'world':
      if (topic === 'Local History' && subtopic === 'Indigenous peoples of BC') {
        content.explanation = 'The Coast Salish peoples, including the Lekwungen Nation, have lived in the Victoria area for thousands of years.';
        content.examples = [
          'The Lekwungen people traditionally fished for salmon',
          'They built beautiful totem poles that tell stories',
          'They used cedar trees to make canoes and houses',
        ];
        content.funFact = 'The name "Saanich" comes from the WSÁNEĆ people, meaning "emerging land" or "emerging people".';
        content.activity = 'Research one Indigenous art form from BC and try creating your own version!';
        content.localConnection = 'You can see totem poles at Thunderbird Park in Victoria!';
      }
      break;
  }

  return {
    moduleId,
    topic: `${topic}: ${subtopic}`,
    content,
    source: 'curriculum',
  };
}

// Update knowledge base with new content
export async function updateKnowledgeBase(update: ContentUpdate) {
  try {
    // Check if item already exists
    const existing = await prisma.knowledgeItem.findFirst({
      where: {
        moduleId: update.moduleId,
        topic: update.topic,
      },
    });

    if (existing) {
      // Update existing item
      await prisma.knowledgeItem.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(update.content),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new item
      await prisma.knowledgeItem.create({
        data: {
          moduleId: update.moduleId,
          topic: update.topic,
          difficulty: 'medium',
          gradeLevel: 4,
          content: JSON.stringify(update.content),
          tags: JSON.stringify([update.moduleId, 'grade4', 'bc-curriculum']),
        },
      });
    }

    // Log the update
    await prisma.contentUpdate.create({
      data: {
        version: `v${Date.now()}`,
        moduleId: update.moduleId,
        type: 'knowledge',
        changes: JSON.stringify({
          topic: update.topic,
          source: update.source,
          timestamp: new Date(),
        }),
        source: update.source,
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return false;
  }
}

// Sync curriculum content (run periodically)
export async function syncCurriculumContent() {
  const updates: ContentUpdate[] = [];

  // Iterate through all curriculum topics
  for (const [moduleId, topics] of Object.entries(CURRICULUM_TOPICS)) {
    for (const [topic, subtopics] of Object.entries(topics)) {
      for (const subtopic of subtopics) {
        const content = await generateCurriculumContent(
          moduleId === 'social' ? 'world' : moduleId === 'language' ? 'stories' : moduleId,
          topic,
          subtopic
        );
        updates.push(content);
      }
    }
  }

  // Process updates
  let successCount = 0;
  for (const update of updates) {
    const success = await updateKnowledgeBase(update);
    if (success) successCount++;
  }

  console.log(`Knowledge sync completed: ${successCount}/${updates.length} items updated`);
  return { total: updates.length, success: successCount };
}

// Get personalized content recommendations
export async function getPersonalizedContent(userId: string, moduleId: string) {
  // Get user's learning history
  const userKnowledge = await prisma.userKnowledge.findMany({
    where: { userId },
    orderBy: { lastSeen: 'desc' },
    take: 10,
  });

  // Get user's progress
  const progress = await prisma.progress.findUnique({
    where: { userId },
    include: {
      moduleProgress: {
        where: { moduleId },
      },
    },
  });

  if (!progress) return [];

  const masteryLevel = progress.moduleProgress[0]?.masteryLevel || 0;

  // Determine appropriate difficulty
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (masteryLevel >= 3) difficulty = 'medium';
  if (masteryLevel >= 4) difficulty = 'hard';

  // Get appropriate content
  const content = await prisma.knowledgeItem.findMany({
    where: {
      moduleId,
      difficulty,
      gradeLevel: { lte: 4 },
      NOT: {
        id: {
          in: userKnowledge.map(uk => uk.knowledgeItemId),
        },
      },
    },
    take: 5,
  });

  return content.map(item => ({
    ...item,
    content: JSON.parse(item.content),
    tags: JSON.parse(item.tags),
  }));
}

// Track learning progress
export async function trackLearning(userId: string, knowledgeItemId: string, performance: number) {
  const existing = await prisma.userKnowledge.findFirst({
    where: { userId, knowledgeItemId },
  });

  if (existing) {
    // Update mastery based on performance
    const newMastery = Math.min(1, existing.mastery + performance * 0.1);
    
    await prisma.userKnowledge.update({
      where: { id: existing.id },
      data: {
        mastery: newMastery,
        lastSeen: new Date(),
        timesReviewed: { increment: 1 },
      },
    });
  } else {
    // Create new tracking record
    await prisma.userKnowledge.create({
      data: {
        userId,
        knowledgeItemId,
        mastery: performance * 0.2,
      },
    });
  }
}

// Schedule daily content updates
export async function scheduleDailyUpdates() {
  // This would be called by a cron job or scheduler
  // For now, it's a manual function
  
  console.log('Starting daily knowledge update...');
  
  // Sync curriculum content
  await syncCurriculumContent();
  
  // Fetch updated content for trending topics (safe, educational)
  const trendingTopics = [
    'Solar system',
    'Rainforest animals',
    'Ancient Egypt',
    'Renewable energy',
  ];
  
  for (const topic of trendingTopics) {
    const content = await fetchWikipediaContent(topic);
    if (content) {
      await updateKnowledgeBase({
        moduleId: 'world',
        topic,
        content: {
          explanation: content,
          source: 'wikipedia',
          simplified: true,
        },
        source: 'wikipedia',
      });
    }
  }
  
  console.log('Daily knowledge update completed');
}