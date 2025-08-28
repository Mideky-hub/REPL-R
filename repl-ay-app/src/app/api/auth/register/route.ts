import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/lib/UserService';
import AuthUtils from '@/lib/AuthUtils';
import MailerLiteService from '@/lib/MailerLiteService';

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

    // Validate email format
    if (!AuthUtils.isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = AuthUtils.isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements', 
          details: passwordValidation.errors 
        }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' }, 
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(password);

    // Create new user
    const newUser = await UserService.createUser({
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      gdprConsentedAt: new Date(),
    });

    // Add user to MailerLite newsletter (async, don't block registration)
    MailerLiteService.addSubscriber(email.toLowerCase()).catch(error => {
      console.error('MailerLite subscription failed for:', email, error);
      // Don't fail registration if newsletter signup fails
    });

    // Generate JWT token
    const token = await AuthUtils.generateToken({
      userId: newUser.id,
      email: newUser.email,
      tier: newUser.tier
    });

    // Return sanitized user data and token
    const sanitizedUser = AuthUtils.sanitizeUser(newUser);

    return NextResponse.json({
      user: sanitizedUser,
      token,
      isNewUser: true,
      needsOnboarding: true,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' }, 
      { status: 500 }
    );
  }
}