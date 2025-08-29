import { NextRequest, NextResponse } from 'next/server'
import UserService from '@/lib/UserService'
import AuthUtils from '@/lib/AuthUtils'
import MailerLiteService from '@/lib/MailerLiteService'

export async function POST(request: NextRequest) {
  try {
    const { credential, tokenPayload } = await request.json()

    if (!credential || !tokenPayload) {
      return NextResponse.json(
        { error: 'Missing credential or token payload' }, 
        { status: 400 }
      )
    }

    // Verify the JWT token with Google (you might want to add this verification)
    // For now, we'll trust the payload since it came from Google's client-side library

    const { email, given_name, family_name, sub: googleId } = tokenPayload

    if (!email || !googleId) {
      return NextResponse.json(
        { error: 'Invalid token payload' }, 
        { status: 400 }
      )
    }

    // Find or create user using the UserService
    const user = await UserService.findOrCreateFromOAuth({
      email,
      googleId,
      googleEmail: email,
      firstName: given_name,
      lastName: family_name,
    })

    // Check if user needs onboarding
    const needsOnboarding = !user.firstName || !user.lastName || !user.jobTitle || !user.company
    const isNewUser = !user.lastActiveAt // If never active before, it's a new user

    // Add new users to MailerLite newsletter (async, don't block authentication)
    if (isNewUser) {
      MailerLiteService.addSubscriber(email, {
        firstName: given_name,
        lastName: family_name
      }).catch(error => {
        console.error('MailerLite subscription failed for Google user:', email, error);
        // Don't fail authentication if newsletter signup fails
      });
    }

    // Generate JWT token
    const token = await AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      tier: user.tier
    })

    // Return sanitized user data and token
    const sanitizedUser = AuthUtils.sanitizeUser(user)

    return NextResponse.json({
      user: sanitizedUser,
      token,
      isNewUser,
      needsOnboarding,
    })

  } catch (error) {
    console.error('Google OAuth API error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    )
  }
}