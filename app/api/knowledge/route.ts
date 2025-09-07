import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { 
  getAdaptiveContent
} from '@/lib/database';
import { 
  syncCurriculumContent, 
  scheduleDailyUpdates 
} from '@/lib/knowledge-updater';

// Get personalized learning content
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

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID required' },
        { status: 400 }
      );
    }

    // Get adaptive content based on user's knowledge state
    const adaptiveContent = await getAdaptiveContent(tokenData.userId, moduleId);
    
    // For now, return the same content as personalized (can be enhanced later)
    const personalizedContent = adaptiveContent;

    return NextResponse.json({
      adaptive: adaptiveContent,
      personalized: personalizedContent,
    });
  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// Track learning progress on a knowledge item
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

    const { knowledgeItemId, performance } = await request.json();

    if (!knowledgeItemId || typeof performance !== 'number') {
      return NextResponse.json(
        { error: 'Invalid learning data' },
        { status: 400 }
      );
    }

    // TODO: Implement learning tracking
    // await trackLearning(tokenData.userId, knowledgeItemId, performance);
    console.log('Tracking learning:', { userId: tokenData.userId, knowledgeItemId, performance });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Learning tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track learning' },
      { status: 500 }
    );
  }
}

// Update knowledge base (parent/admin only)
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData || tokenData.role !== 'parent') {
      return NextResponse.json({ error: 'Parent access required' }, { status: 403 });
    }

    const { action } = await request.json();

    if (action === 'sync') {
      // Sync curriculum content
      const result = await syncCurriculumContent();
      return NextResponse.json(result);
    } else if (action === 'daily-update') {
      // Run daily updates
      await scheduleDailyUpdates();
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Knowledge update error:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
      { status: 500 }
    );
  }
}