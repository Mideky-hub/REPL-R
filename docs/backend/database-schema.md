# Database Schema - R; AI Agent Crew Studio

## Overview
This database schema is designed to maximize valuable user data collection while maintaining full GDPR compliance. All data is categorized by processing purpose and legal basis.

## GDPR Data Categories

### 1. Essential Data (Contractual Necessity)
- User accounts and authentication
- Subscription and payment data
- Core service usage

### 2. Performance Data (Legitimate Interest)
- Application performance metrics
- Usage analytics
- Error tracking

### 3. Marketing Data (Consent Based)
- Email preferences
- Marketing analytics
- Third-party integrations

### 4. Research Data (Consent Based)
- AI model training data
- Conversation analysis
- Behavioral patterns

## Core Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Essential Identity Data (Contractual)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    
    -- Subscription Data (Contractual)
    tier user_tier NOT NULL DEFAULT 'curious',
    stripe_customer_id VARCHAR(255),
    subscription_status subscription_status DEFAULT 'none',
    subscription_expires_at TIMESTAMP,
    
    -- Profile Data (Contractual/Consent)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    
    -- Location Data (Consent)
    country VARCHAR(2), -- ISO country code
    timezone VARCHAR(50),
    ip_address INET,
    
    -- System Data
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP,
    
    -- GDPR Compliance
    gdpr_consent_version INTEGER DEFAULT 1,
    gdpr_consented_at TIMESTAMP,
    data_retention_until TIMESTAMP,
    
    -- Soft delete for GDPR
    deleted_at TIMESTAMP,
    deletion_reason VARCHAR(50) -- 'user_request', 'retention_expired', 'account_closure'
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tier ON users(tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(last_active_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_retention ON users(data_retention_until) WHERE deleted_at IS NULL;
```

### user_consents
```sql
-- GDPR Consent Management
CREATE TABLE user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    consent_type consent_type NOT NULL, -- 'marketing', 'analytics', 'research', 'cookies'
    consent_given BOOLEAN NOT NULL,
    legal_basis legal_basis NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'
    
    -- Consent Details
    purpose TEXT NOT NULL, -- What the data is used for
    data_categories TEXT[], -- Array of data categories
    retention_period INTERVAL, -- How long data is kept
    
    -- Audit Trail
    ip_address INET,
    user_agent TEXT,
    consent_method VARCHAR(50), -- 'registration', 'settings', 'popup', 'api'
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP, -- For time-limited consent
    
    -- Withdrawal tracking
    withdrawn_at TIMESTAMP,
    withdrawal_reason TEXT
);

CREATE INDEX idx_consents_user ON user_consents(user_id);
CREATE INDEX idx_consents_type ON user_consents(consent_type, consent_given);
```

### chat_sessions
```sql
-- Chat Sessions and Conversations
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Session Data (Contractual)
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    mode chat_mode NOT NULL DEFAULT 'normal', -- 'normal', 'parallel'
    
    -- Context Data (Performance/Research)
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMP,
    
    -- Analytics (Legitimate Interest)
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    session_duration INTERVAL,
    
    -- GDPR
    anonymized_at TIMESTAMP, -- When PII was removed
    data_retention_until TIMESTAMP
);

CREATE INDEX idx_sessions_user ON chat_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_sessions_created ON chat_sessions(created_at);
```

### chat_messages
```sql
-- Individual Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    -- Message Content (Contractual/Research)
    role message_role NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    content_hash VARCHAR(64), -- For deduplication and analysis
    
    -- AI Model Data (Performance)
    model_used VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,
    
    -- Research Data (Consent Required)
    sentiment_score DECIMAL(3,2), -- -1 to 1
    topic_categories TEXT[], -- AI-generated topics
    language_detected VARCHAR(10),
    complexity_score INTEGER, -- 1-10
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- GDPR
    anonymized BOOLEAN DEFAULT false,
    anonymized_at TIMESTAMP
);

CREATE INDEX idx_messages_session ON chat_messages(session_id);
CREATE INDEX idx_messages_role ON chat_messages(role);
CREATE INDEX idx_messages_created ON chat_messages(created_at);
```

### usage_analytics
```sql
-- Detailed Usage Analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    
    -- Event Data (Legitimate Interest)
    event_type analytics_event NOT NULL,
    event_category VARCHAR(50) NOT NULL, -- 'chat', 'navigation', 'feature', 'error'
    event_action VARCHAR(100) NOT NULL, -- 'send_message', 'switch_mode', 'upgrade_click'
    event_label VARCHAR(255),
    event_value INTEGER,
    
    -- Context Data
    page_url TEXT,
    component_name VARCHAR(100),
    feature_flag VARCHAR(100),
    
    -- Technical Data
    user_agent TEXT,
    viewport_size VARCHAR(20), -- "1920x1080"
    connection_type VARCHAR(20), -- "4g", "wifi", etc.
    
    -- Geographic Data (Consent Required)
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON usage_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_event ON usage_analytics(event_type, event_category);
CREATE INDEX idx_analytics_created ON usage_analytics(created_at);
```

### user_behavior_patterns
```sql
-- ML-Generated Behavior Insights
CREATE TABLE user_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Behavior Analysis (Consent Required)
    pattern_type behavior_pattern NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL, -- 0-1
    
    -- Pattern Data
    pattern_data JSONB NOT NULL, -- Flexible storage for ML insights
    
    -- Usage Patterns
    avg_session_duration INTERVAL,
    peak_usage_hours INTEGER[], -- Array of hours (0-23)
    preferred_features TEXT[],
    conversion_likelihood DECIMAL(3,2),
    
    -- Content Preferences (Research)
    preferred_topics TEXT[],
    complexity_preference VARCHAR(20), -- 'simple', 'moderate', 'complex'
    response_style_preference VARCHAR(20), -- 'concise', 'detailed', 'creative'
    
    -- Temporal Data
    analysis_period_start TIMESTAMP NOT NULL,
    analysis_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- GDPR
    consent_required BOOLEAN DEFAULT true,
    data_retention_until TIMESTAMP
);

CREATE INDEX idx_patterns_user ON user_behavior_patterns(user_id);
CREATE INDEX idx_patterns_type ON user_behavior_patterns(pattern_type);
```

### agent_crews
```sql
-- User-Created Agent Crews
CREATE TABLE agent_crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Crew Data (Contractual)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Configuration (Research Data)
    crew_config JSONB NOT NULL, -- Workflow definition
    version INTEGER DEFAULT 1,
    
    -- Usage Data (Performance)
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    avg_execution_time INTERVAL,
    
    -- Sharing (Marketing/Research)
    is_public BOOLEAN DEFAULT false,
    shared_at TIMESTAMP,
    fork_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### prompt_analytics
```sql
-- Prompt Performance Analytics
CREATE TABLE prompt_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Prompt Data (Research - Consent Required)
    prompt_text TEXT NOT NULL,
    prompt_hash VARCHAR(64) UNIQUE NOT NULL,
    
    -- Performance Metrics
    usage_count INTEGER DEFAULT 1,
    avg_response_time_ms INTEGER,
    avg_user_rating DECIMAL(2,1), -- 1-5 stars
    
    -- AI Analysis (Research)
    clarity_score INTEGER, -- 1-10
    specificity_score INTEGER, -- 1-10
    effectiveness_score INTEGER, -- 1-10
    
    -- Categories
    detected_intent VARCHAR(100),
    topic_categories TEXT[],
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Enums and Types

```sql
-- User and Subscription Types
CREATE TYPE user_tier AS ENUM ('curious', 'free', 'essential', 'developer', 'founder', 'pro');
CREATE TYPE subscription_status AS ENUM ('none', 'active', 'cancelled', 'expired', 'past_due');

-- Chat Types  
CREATE TYPE chat_mode AS ENUM ('normal', 'parallel');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- GDPR Types
CREATE TYPE consent_type AS ENUM ('marketing', 'analytics', 'research', 'cookies', 'third_party');
CREATE TYPE legal_basis AS ENUM ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests');

-- Analytics Types
CREATE TYPE analytics_event AS ENUM (
    'page_view', 'chat_start', 'message_sent', 'mode_switch', 'feature_click',
    'upgrade_view', 'upgrade_click', 'subscription_start', 'error_occurred',
    'session_start', 'session_end', 'export_data', 'delete_account'
);

-- Behavior Pattern Types
CREATE TYPE behavior_pattern AS ENUM (
    'power_user', 'casual_user', 'trial_user', 'convert_likely', 'churn_risk',
    'feature_explorer', 'content_creator', 'researcher', 'developer'
);
```

## Data Retention Policies

### By Legal Basis:
- **Contractual**: Duration of contract + 7 years (accounting)
- **Consent**: Until withdrawn or 2 years inactive
- **Legitimate Interest**: 2 years or until objection
- **Legal Obligation**: As required by law

### By Data Type:
- **Authentication**: Account lifetime + 30 days
- **Chat Content**: User-controlled, max 7 years
- **Analytics**: 26 months (Google Analytics standard)
- **Research Data**: 3 years or consent withdrawal
- **Behavior Patterns**: 2 years or consent withdrawal

## GDPR Compliance Features

### 1. **Data Minimization**
- Only collect data necessary for specified purposes
- Regular data purging based on retention policies
- Anonymization of research data after retention period

### 2. **Consent Management**
- Granular consent for different data types
- Easy withdrawal mechanisms
- Audit trail for all consent changes

### 3. **User Rights**
- **Access**: Export all user data in JSON format
- **Rectification**: User profile editing
- **Erasure**: Complete data deletion
- **Portability**: Structured data export
- **Objection**: Opt-out from legitimate interest processing

### 4. **Privacy by Design**
- Default privacy settings favor user privacy
- Encryption at rest and in transit
- Regular security audits
- Data breach notification procedures

### 5. **Transparency**
- Clear privacy policy explaining all data uses
- Regular consent renewal
- Data processing notifications
- Regular privacy impact assessments