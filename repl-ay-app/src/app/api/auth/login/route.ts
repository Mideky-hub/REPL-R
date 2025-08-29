import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/lib/UserService';
import AuthUtils from '@/lib/AuthUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserService.findByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await AuthUtils.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Check if user needs onboarding
    const needsOnboarding = !user.firstName || !user.lastName || !user.jobTitle || !user.company;

    // Update last active timestamp
    await UserService.updateLastActive(user.id);

    // Generate JWT token
    const token = await AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      tier: user.tier
    });

    // Return sanitized user data and token
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    return NextResponse.json({
      user: sanitizedUser,
      token,
      isNewUser: false,
      needsOnboarding,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Login failed' }, 
      { status: 500 }
    );
  }
}