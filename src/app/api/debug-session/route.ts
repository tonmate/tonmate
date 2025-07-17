import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  console.log('🔍 Debug session endpoint called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('📊 Session data:', JSON.stringify(session, null, 2));
    
    return NextResponse.json({
      success: true,
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id
    });
  } catch (error) {
    console.error('❌ Error checking session:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
