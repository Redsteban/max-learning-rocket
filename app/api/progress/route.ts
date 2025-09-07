import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserProgress, updateProgress, checkAndUnlockAchievements } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const progress = await getUserProgress(tokenData.userId);
    
    if (!progress) {
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { xpEarned, moduleId } = await request.json();

    if (typeof xpEarned !== 'number' || xpEarned < 0) {
      return NextResponse.json(
        { error: 'Invalid XP value' },
        { status: 400 }
      );
    }

    // Update progress
    const updatedProgress = await updateProgress(tokenData.userId, xpEarned, moduleId);

    if (!updatedProgress) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievements(tokenData.userId);

    return NextResponse.json({
      progress: updatedProgress,
      newAchievements,
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}