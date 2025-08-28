import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/lib/UserService';
import AuthUtils from '@/lib/AuthUtils';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' }, 
        { status: 401 }
      );
    }

    // Verify JWT token
    const tokenPayload = await AuthUtils.verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' }, 
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await UserService.findById(tokenPayload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Update last active timestamp
    await UserService.updateLastActive(user.id);

    // Check if user needs onboarding
    const needsOnboarding = !user.firstName || !user.lastName || !user.jobTitle || !user.company;

    // Return sanitized user data
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    return NextResponse.json({
      user: sanitizedUser,
      needsOnboarding,
      message: 'Token verified successfully'
    });

  } catch (error) {
    console.error('Token verification API error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' }, 
      { status: 500 }
    );
  }
}