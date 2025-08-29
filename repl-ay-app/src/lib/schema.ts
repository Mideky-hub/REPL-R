import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  integer, 
  decimal, 
  interval, 
  jsonb, 
  inet,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTierEnum = pgEnum('user_tier', ['curious', 'free', 'essential', 'developer', 'founder', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['none', 'active', 'cancelled', 'expired', 'past_due']);
export const chatModeEnum = pgEnum('chat_mode', ['normal', 'parallel']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const consentTypeEnum = pgEnum('consent_type', ['marketing', 'analytics', 'research', 'cookies', 'third_party']);
export const legalBasisEnum = pgEnum('legal_basis', ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Essential Identity Data
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  
  // OAuth Integration
  googleId: varchar('google_id', { length: 255 }).unique(),
  googleEmail: varchar('google_email', { length: 255 }),
  
  // Subscription Data
  tier: userTierEnum('tier').notNull().default('curious'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('none'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  
  // Profile Data
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  company: varchar('company', { length: 255 }),
  jobTitle: varchar('job_title', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  
  // Location Data
  country: varchar('country', { length: 2 }),
  timezone: varchar('timezone', { length: 50 }),
  ipAddress: inet('ip_address'),
  
  // System Data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
  
  // GDPR Compliance
  gdprConsentVersion: integer('gdpr_consent_version').default(1),
  gdprConsentedAt: timestamp('gdpr_consented_at'),
  dataRetentionUntil: timestamp('data_retention_until'),
  
  // Soft delete
  deletedAt: timestamp('deleted_at'),
  deletionReason: varchar('deletion_reason', { length: 50 }),
});

// User Onboarding Data table
export const userOnboardingData = pgTable('user_onboarding_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Company & Role Information
  companySize: varchar('company_size', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  
  // Background & Usage Information
  hearAboutUs: varchar('hear_about_us', { length: 100 }),
  primaryUseCase: varchar('primary_use_case', { length: 100 }),
  experienceLevel: varchar('experience_level', { length: 50 }),
  interests: text('interests').array(),
  
  // Marketing & Communication Preferences
  marketingConsent: boolean('marketing_consent').default(false),
  
  // Completion Tracking
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const userConsents = pgTable('user_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  consentType: consentTypeEnum('consent_type').notNull(),
  consentGiven: boolean('consent_given').notNull(),
  legalBasis: legalBasisEnum('legal_basis').notNull(),
  
  // Consent Details
  purpose: text('purpose').notNull(),
  dataCategories: text('data_categories').array(),
  retentionPeriod: interval('retention_period'),
  
  // Audit Trail
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  consentMethod: varchar('consent_method', { length: 50 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  
  // Withdrawal tracking
  withdrawnAt: timestamp('withdrawn_at'),
  withdrawalReason: text('withdrawal_reason'),
});

// Chat Sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Session Data
  title: varchar('title', { length: 255 }).notNull().default('New Chat'),
  mode: chatModeEnum('mode').notNull().default('normal'),
  
  // Context Data
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  referrer: text('referrer'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at'),
  
  // Analytics
  messageCount: integer('message_count').default(0),
  totalTokens: integer('total_tokens').default(0),
  sessionDuration: interval('session_duration'),
  
  // GDPR
  anonymizedAt: timestamp('anonymized_at'),
  dataRetentionUntil: timestamp('data_retention_until'),
});

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  
  // Message Content
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  contentHash: varchar('content_hash', { length: 64 }),
  
  // AI Model Data
  modelUsed: varchar('model_used', { length: 100 }),
  tokensUsed: integer('tokens_used'),
  responseTimeMs: integer('response_time_ms'),
  
  // Research Data
  sentimentScore: decimal('sentiment_score', { precision: 3, scale: 2 }),
  topicCategories: text('topic_categories').array(),
  languageDetected: varchar('language_detected', { length: 10 }),
  complexityScore: integer('complexity_score'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  
  // GDPR
  anonymized: boolean('anonymized').default(false),
  anonymizedAt: timestamp('anonymized_at'),
});

// Agent Crews table
export const agentCrews = pgTable('agent_crews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Crew Data
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  
  // Configuration
  crewConfig: jsonb('crew_config').notNull(),
  version: integer('version').default(1),
  
  // Usage Data
  executionCount: integer('execution_count').default(0),
  lastExecutedAt: timestamp('last_executed_at'),
  avgExecutionTime: interval('avg_execution_time'),
  
  // Sharing
  isPublic: boolean('is_public').default(false),
  sharedAt: timestamp('shared_at'),
  forkCount: integer('fork_count').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  consents: many(userConsents),
  onboardingData: one(userOnboardingData),
  chatSessions: many(chatSessions),
  agentCrews: many(agentCrews),
}));

export const userOnboardingDataRelations = relations(userOnboardingData, ({ one }) => ({
  user: one(users, {
    fields: [userOnboardingData.userId],
    references: [users.id],
  }),
}));

export const userConsentsRelations = relations(userConsents, ({ one }) => ({
  user: one(users, {
    fields: [userConsents.userId],
    references: [users.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const agentCrewsRelations = relations(agentCrews, ({ one }) => ({
  user: one(users, {
    fields: [agentCrews.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserOnboardingData = typeof userOnboardingData.$inferSelect;
export type NewUserOnboardingData = typeof userOnboardingData.$inferInsert;
export type UserConsent = typeof userConsents.$inferSelect;
export type NewUserConsent = typeof userConsents.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type AgentCrew = typeof agentCrews.$inferSelect;
export type NewAgentCrew = typeof agentCrews.$inferInsert;