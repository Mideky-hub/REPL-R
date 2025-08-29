import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { getPool } from './db';
import { users, userConsents, userOnboardingData, chatSessions, type User, type NewUser, type NewUserConsent, type NewUserOnboardingData } from './schema';

// Initialize Drizzle with the connection pool
const db = drizzle(getPool());

export class UserService {
  // Create a new user
  static async createUser(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(
      and(eq(users.email, email), isNull(users.deletedAt))
    );
    return user || null;
  }

  // Find user by Google ID
  static async findByGoogleId(googleId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(
      and(eq(users.googleId, googleId), isNull(users.deletedAt))
    );
    return user || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(
      and(eq(users.id, id), isNull(users.deletedAt))
    );
    return user || null;
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
    return user || null;
  }

  // Update last active timestamp
  static async updateLastActive(id: string): Promise<void> {
    await db.update(users)
      .set({ lastActiveAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
  }

  // Create or update user consent
  static async setConsent(consentData: NewUserConsent): Promise<void> {
    await db.insert(userConsents).values(consentData);
  }

  // Get user's consents
  static async getUserConsents(userId: string) {
    return await db.select().from(userConsents).where(eq(userConsents.userId, userId));
  }

  // Soft delete user (GDPR compliant)
  static async deleteUser(id: string, reason: string = 'user_request'): Promise<boolean> {
    const [deletedUser] = await db.update(users)
      .set({ 
        deletedAt: new Date(),
        deletionReason: reason,
        // Clear sensitive data
        email: `deleted_${Date.now()}@repl-ay.com`,
        firstName: null,
        lastName: null,
        phone: null,
        ipAddress: null,
      })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
    
    return !!deletedUser;
  }

  // Get user's chat sessions
  static async getUserChatSessions(userId: string) {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(chatSessions.createdAt);
  }

  // Create user from OAuth (Google)
  static async createFromOAuth(oauthData: {
    email: string;
    googleId: string;
    googleEmail: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const userData: NewUser = {
      email: oauthData.email,
      googleId: oauthData.googleId,
      googleEmail: oauthData.googleEmail,
      firstName: oauthData.firstName,
      lastName: oauthData.lastName,
      passwordHash: 'oauth', // Placeholder for OAuth users
      emailVerified: true,
      emailVerifiedAt: new Date(),
      gdprConsentedAt: new Date(),
    };

    return this.createUser(userData);
  }

  // Find or create user from OAuth
  static async findOrCreateFromOAuth(oauthData: {
    email: string;
    googleId: string;
    googleEmail: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    // First try to find by Google ID
    let user = await this.findByGoogleId(oauthData.googleId);
    
    if (user) {
      // Update last active and return existing user
      await this.updateLastActive(user.id);
      return user;
    }

    // Then try to find by email
    user = await this.findByEmail(oauthData.email);
    
    if (user) {
      // Link Google account to existing user
      const updatedUser = await this.updateUser(user.id, {
        googleId: oauthData.googleId,
        googleEmail: oauthData.googleEmail,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      
      if (updatedUser) {
        await this.updateLastActive(updatedUser.id);
        return updatedUser;
      }
    }

    // Create new user
    return this.createFromOAuth(oauthData);
  }

  // Save user onboarding data
  static async saveOnboardingData(onboardingData: NewUserOnboardingData): Promise<void> {
    await db.insert(userOnboardingData).values(onboardingData);
  }

  // Get user's onboarding data
  static async getUserOnboardingData(userId: string) {
    const [data] = await db.select().from(userOnboardingData).where(eq(userOnboardingData.userId, userId));
    return data || null;
  }

  // Verify user's tier and subscription
  static async verifySubscription(userId: string): Promise<{ tier: string; isActive: boolean }> {
    const user = await this.findById(userId);
    
    if (!user) {
      return { tier: 'curious', isActive: false };
    }

    const isActive = user.subscriptionStatus === 'active' && 
      (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > new Date());

    return {
      tier: user.tier,
      isActive,
    };
  }

  // Update user subscription data
  static async updateUserSubscription(userId: string, subscriptionData: {
    plan?: string;
    status?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'none';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }): Promise<User | null> {
    const updates: Partial<User> = {};

    console.log('🔧 UserService.updateUserSubscription called with:', {
      userId,
      subscriptionData
    })

    if (subscriptionData.status) {
      updates.subscriptionStatus = subscriptionData.status;
    }

    if (subscriptionData.stripeCustomerId) {
      const customerId = subscriptionData.stripeCustomerId.toString()
      console.log(`🎯 Setting stripeCustomerId: "${customerId}" (length: ${customerId.length})`)
      updates.stripeCustomerId = customerId;
    }

    if (subscriptionData.stripeSubscriptionId) {
      const subscriptionId = subscriptionData.stripeSubscriptionId.toString()
      console.log(`🎯 Setting stripeSubscriptionId: "${subscriptionId}" (length: ${subscriptionId.length})`)
      // Note: We don't have a stripeSubscriptionId field in the schema, skipping for now
    }

    if (subscriptionData.currentPeriodEnd) {
      updates.subscriptionExpiresAt = subscriptionData.currentPeriodEnd;
    }

    // Set tier based on plan
    if (subscriptionData.plan) {
      console.log(`🎯 Mapping plan "${subscriptionData.plan}" to user tier`)
      
      // Map Stripe plan names to user tiers
      const planName = subscriptionData.plan.toLowerCase()
      if (planName.includes('founder')) {
        updates.tier = 'founder'
        console.log('👑 Upgrading user to Founder tier')
      } else if (planName.includes('developer')) {
        updates.tier = 'developer'
        console.log('🛠️ Upgrading user to Developer tier')
      } else if (planName.includes('essential')) {
        updates.tier = 'essential'
        console.log('⚡ Upgrading user to Essential tier')
      } else if (planName.includes('pro')) {
        updates.tier = 'pro'
        console.log('💎 Upgrading user to Pro tier')
      } else {
        updates.tier = 'free'
        console.log('🆓 Setting user to Free tier (fallback)')
      }
    }

    console.log('📝 Final updates object:', updates)

    return this.updateUser(userId, updates);
  }
}

export default UserService;