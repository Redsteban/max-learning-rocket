import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const setupComplete = cookieStore.get('max-setup-complete');
    const username = cookieStore.get('max-username');
    
    // Check localStorage fallback (handled on client side)
    const isSetup = setupComplete?.value === 'true';
    
    return NextResponse.json({
      isSetup,
      name: username?.value || null,
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({
      isSetup: false,
      name: null,
    });
  }
}