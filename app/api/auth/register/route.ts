import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In-memory storage for MVP (replace with database in production)
const users = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      name,
      age,
      interests,
      favoriteColor,
      animalPassword,
      parentEmail,
      parentPassword,
    } = body;

    // Validate required fields
    if (!username || !name || !age || !animalPassword || animalPassword.length !== 4) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (users.has(username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash parent password if provided
    let hashedParentPassword = null;
    if (parentPassword) {
      hashedParentPassword = await bcrypt.hash(parentPassword, 10);
    }

    // Create user object
    const user = {
      id: Date.now().toString(),
      username,
      name,
      age,
      interests,
      favoriteColor,
      animalPassword, // In production, this should be hashed
      parentEmail,
      parentPassword: hashedParentPassword,
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 1,
      badges: [],
      completedModules: [],
      learningPath: generateLearningPath(interests),
    };

    // Store user
    users.set(username, user);
    
    // Also store parent account if email provided
    if (parentEmail) {
      users.set(parentEmail, {
        ...user,
        role: 'parent',
        childUsername: username,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Store setup completion
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        interests: user.interests,
        favoriteColor: user.favoriteColor,
        level: user.level,
        xp: user.xp,
      },
      token,
    });

    // Set cookie for setup completion
    response.cookies.set('max-setup-complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set('max-username', username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

// Generate personalized learning path based on interests
function generateLearningPath(interests: string[]) {
  const modules = [];
  
  // Map interests to learning modules
  const interestModules: Record<string, any[]> = {
    math: [
      { id: 'math-basics', name: 'Number Adventures', difficulty: 1 },
      { id: 'math-puzzles', name: 'Math Puzzles', difficulty: 2 },
      { id: 'math-games', name: 'Math Games', difficulty: 2 },
    ],
    science: [
      { id: 'science-explore', name: 'Science Explorer', difficulty: 1 },
      { id: 'experiments', name: 'Fun Experiments', difficulty: 2 },
      { id: 'nature', name: 'Nature Discovery', difficulty: 1 },
    ],
    art: [
      { id: 'drawing-basics', name: 'Learn to Draw', difficulty: 1 },
      { id: 'colors', name: 'Color Magic', difficulty: 1 },
      { id: 'creative-projects', name: 'Creative Projects', difficulty: 2 },
    ],
    coding: [
      { id: 'coding-intro', name: 'Code Basics', difficulty: 1 },
      { id: 'scratch', name: 'Scratch Programming', difficulty: 2 },
      { id: 'game-design', name: 'Design Your Game', difficulty: 3 },
    ],
    reading: [
      { id: 'story-time', name: 'Story Adventures', difficulty: 1 },
      { id: 'vocabulary', name: 'Word Power', difficulty: 2 },
      { id: 'creative-writing', name: 'Write Stories', difficulty: 2 },
    ],
    music: [
      { id: 'rhythm', name: 'Rhythm & Beats', difficulty: 1 },
      { id: 'instruments', name: 'Musical Instruments', difficulty: 2 },
      { id: 'compose', name: 'Create Music', difficulty: 3 },
    ],
  };

  // Add modules based on selected interests
  interests.forEach(interest => {
    if (interestModules[interest]) {
      modules.push(...interestModules[interest]);
    }
  });

  // Add some general modules everyone gets
  modules.push(
    { id: 'welcome', name: 'Welcome to Learning!', difficulty: 0 },
    { id: 'daily-challenges', name: 'Daily Challenges', difficulty: 1 },
  );

  // Sort by difficulty for progressive learning
  modules.sort((a, b) => a.difficulty - b.difficulty);

  return modules;
}

// Export users for other routes to access (temporary for MVP)
export { users };