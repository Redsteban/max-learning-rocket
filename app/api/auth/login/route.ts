import { NextRequest, NextResponse } from 'next/server';
import { authenticateChild, authenticateParent } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, picturePassword, mode } = body;

    if (!username || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let session;

    if (mode === 'child') {
      if (!picturePassword || picturePassword.length !== 4) {
        return NextResponse.json(
          { error: 'Invalid picture password' },
          { status: 400 }
        );
      }
      session = await authenticateChild(username, picturePassword);
    } else if (mode === 'parent') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }
      session = await authenticateParent(username, password);
    } else {
      return NextResponse.json(
        { error: 'Invalid login mode' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}