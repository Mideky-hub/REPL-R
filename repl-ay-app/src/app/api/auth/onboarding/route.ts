import { NextRequest, NextResponse } from 'next/server'
import UserService from '@/lib/UserService'
import MailerLiteService from '@/lib/MailerLiteService'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware (user is already authenticated)
    const userId = request.headers.get('X-User-ID')
    const { onboardingData } = await request.json()

    if (!userId || !onboardingData) {
      return NextResponse.json(
        { error: 'Missing user ID or onboarding data' }, 
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      jobTitle,
      company,
      companySize,
      industry,
      hearAboutUs,
      primaryUseCase,
      experienceLevel,
      interests,
      marketingConsent
    } = onboardingData

    // Validate required fields
    if (!firstName || !lastName || !jobTitle || !company) {
      return NextResponse.json(
        { error: 'Missing required onboarding fields' }, 
        { status: 400 }
      )
    }

    // Update user profile with onboarding data
    const updatedUser = await UserService.updateUser(userId, {
      firstName,
      lastName,
      jobTitle,
      company,
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    // Save detailed onboarding data
    await UserService.saveOnboardingData({
      userId,
      companySize,
      industry,
      hearAboutUs,
      primaryUseCase,
      experienceLevel,
      interests,
      marketingConsent,
    })

    // Create marketing consent record if user opted in
    if (marketingConsent) {
      await UserService.setConsent({
        userId,
        consentType: 'marketing',
        consentGiven: true,
        legalBasis: 'consent',
        purpose: 'Marketing communications and product updates',
        dataCategories: ['email', 'profile_data'],
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  '127.0.0.1',
        userAgent: request.headers.get('user-agent') || '',
        consentMethod: 'onboarding_form',
      })
    }

    // Log onboarding completion for analytics
    console.log('User onboarding completed:', {
      userId,
      email: updatedUser.email,
      company,
      companySize,
      industry,
      hearAboutUs,
      primaryUseCase,
      experienceLevel,
      interests: interests.join(','),
      marketingConsent,
      completedAt: new Date().toISOString(),
    })

    // Update MailerLite subscriber with complete profile information (async)
    MailerLiteService.updateSubscriber(updatedUser.email, {
      firstName,
      lastName,
      company,
      jobTitle
    }).catch(error => {
      console.error('MailerLite update failed after onboarding:', updatedUser.email, error);
      // Don't fail onboarding if newsletter update fails
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        jobTitle: updatedUser.jobTitle,
        company: updatedUser.company,
        tier: updatedUser.tier,
        createdAt: updatedUser.createdAt,
      },
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' }, 
      { status: 500 }
    )
  }
}