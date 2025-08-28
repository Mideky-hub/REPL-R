CREATE TYPE "public"."chat_mode" AS ENUM('normal', 'parallel');--> statement-breakpoint
CREATE TYPE "public"."consent_type" AS ENUM('marketing', 'analytics', 'research', 'cookies', 'third_party');--> statement-breakpoint
CREATE TYPE "public"."legal_basis" AS ENUM('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('none', 'active', 'cancelled', 'expired', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."user_tier" AS ENUM('curious', 'free', 'essential', 'developer', 'founder', 'pro');--> statement-breakpoint
CREATE TABLE "agent_crews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"crew_config" jsonb NOT NULL,
	"version" integer DEFAULT 1,
	"execution_count" integer DEFAULT 0,
	"last_executed_at" timestamp,
	"avg_execution_time" interval,
	"is_public" boolean DEFAULT false,
	"shared_at" timestamp,
	"fork_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"content_hash" varchar(64),
	"model_used" varchar(100),
	"tokens_used" integer,
	"response_time_ms" integer,
	"sentiment_score" numeric(3, 2),
	"topic_categories" text[],
	"language_detected" varchar(10),
	"complexity_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"anonymized" boolean DEFAULT false,
	"anonymized_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" varchar(255) DEFAULT 'New Chat' NOT NULL,
	"mode" "chat_mode" DEFAULT 'normal' NOT NULL,
	"user_agent" text,
	"ip_address" "inet",
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"session_duration" interval,
	"anonymized_at" timestamp,
	"data_retention_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consent_type" "consent_type" NOT NULL,
	"consent_given" boolean NOT NULL,
	"legal_basis" "legal_basis" NOT NULL,
	"purpose" text NOT NULL,
	"data_categories" text[],
	"retention_period" interval,
	"ip_address" "inet",
	"user_agent" text,
	"consent_method" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"withdrawn_at" timestamp,
	"withdrawal_reason" text
);
--> statement-breakpoint
CREATE TABLE "user_onboarding_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_size" varchar(100),
	"industry" varchar(100),
	"hear_about_us" varchar(100),
	"primary_use_case" varchar(100),
	"experience_level" varchar(50),
	"interests" text[],
	"marketing_consent" boolean DEFAULT false,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_onboarding_data_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"google_id" varchar(255),
	"google_email" varchar(255),
	"tier" "user_tier" DEFAULT 'curious' NOT NULL,
	"stripe_customer_id" varchar(255),
	"subscription_status" "subscription_status" DEFAULT 'none',
	"subscription_expires_at" timestamp,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"company" varchar(255),
	"job_title" varchar(255),
	"phone" varchar(50),
	"country" varchar(2),
	"timezone" varchar(50),
	"ip_address" "inet",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	"gdpr_consent_version" integer DEFAULT 1,
	"gdpr_consented_at" timestamp,
	"data_retention_until" timestamp,
	"deleted_at" timestamp,
	"deletion_reason" varchar(50),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "agent_crews" ADD CONSTRAINT "agent_crews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding_data" ADD CONSTRAINT "user_onboarding_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;