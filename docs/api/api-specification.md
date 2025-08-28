# API Documentation - R; Backend Services

## Base URL
```
https://api.repl-ay.com/v1
```

## Authentication
All authenticated endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Data Collection Strategy

### Tier 1: Essential Data (No Consent Required)
- User registration and authentication
- Subscription management
- Core service functionality

### Tier 2: Performance Data (Legitimate Interest)
- API performance metrics
- Error tracking and debugging
- Usage statistics for service improvement

### Tier 3: Analytics Data (Consent Required)
- Detailed user behavior
- Feature usage patterns  
- A/B testing data

### Tier 4: Research Data (Explicit Consent)
- Chat content analysis
- AI model training
- Behavioral profiling

## Core Endpoints

### Authentication & User Management

#### POST /auth/register
Register new user with maximum data collection
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "first_name": "John", // Optional but encouraged
  "last_name": "Doe", // Optional but encouraged
  "company": "Acme Corp", // Optional - valuable for B2B insights
  "job_title": "Developer", // Optional - valuable for targeting
  "phone": "+1234567890", // Optional - for premium features
  "referral_source": "google", // Track acquisition channels
  "utm_source": "google", // Marketing attribution
  "utm_medium": "cpc", // Marketing attribution
  "utm_campaign": "ai-tools", // Marketing attribution
  "consent": {
    "marketing": true, // Email marketing consent
    "analytics": true, // Behavior tracking consent
    "research": false, // AI training consent
    "cookies": true // Cookie consent
  },
  "client_info": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1", // Collected server-side
    "timezone": "America/New_York",
    "language": "en-US",
    "viewport": "1920x1080",
    "device_type": "desktop"
  }
}
```

#### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "remember_me": true,
  "client_info": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "auto-detected",
    "device_fingerprint": "generated_hash"
  }
}
```

#### GET /auth/profile
Get user profile with privacy-aware data
```json
Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tier": "free",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      // Other fields based on privacy settings
    }
  },
  "privacy": {
    "consents": {
      "marketing": true,
      "analytics": true,
      "research": false
    },
    "data_retention": {
      "chat_history": "2025-08-27T00:00:00Z",
      "analytics": "2025-02-27T00:00:00Z"
    }
  }
}
```

### Chat & Messaging

#### POST /chat/sessions
Create new chat session
```json
{
  "title": "New Chat", // Optional
  "mode": "normal", // 'normal' | 'parallel'
  "context": {
    "referrer": "https://repl-ay.com/",
    "feature_flags": ["parallel_chat_v2"],
    "user_agent": "Mozilla/5.0...",
    "viewport": "1920x1080"
  }
}
```

#### POST /chat/sessions/{session_id}/messages
Send message with comprehensive tracking
```json
{
  "content": "Help me write a Python script",
  "role": "user",
  "metadata": {
    "typing_time_ms": 5000, // Time spent typing
    "character_count": 35,
    "word_count": 7,
    "language_detected": "en",
    "timestamp_started": "2025-08-27T10:00:00Z",
    "timestamp_sent": "2025-08-27T10:00:05Z",
    "source": "main_input", // 'main_input' | 'suggestion_click' | 'template'
    "context": {
      "previous_messages_count": 3,
      "session_duration": 300, // seconds
      "parallel_instances": 2
    }
  },
  "analytics": {
    "feature_used": "basic_chat",
    "user_intent": "code_generation", // AI-detected
    "complexity_estimate": 3 // 1-10 scale
  }
}
```

#### GET /chat/sessions
List user's chat sessions with analytics
```json
Response:
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Python Script Help",
      "created_at": "2025-08-27T10:00:00Z",
      "last_message_at": "2025-08-27T10:15:00Z",
      "message_count": 12,
      "mode": "normal",
      "analytics": {
        "session_duration": 900, // seconds
        "avg_response_time": 1200, // ms
        "user_satisfaction": 4.5, // if rated
        "topics": ["python", "scripting", "automation"]
      }
    }
  ],
  "metadata": {
    "total_count": 1,
    "page": 1,
    "per_page": 20
  }
}
```

### Analytics & Tracking

#### POST /analytics/events
Track user interactions
```json
{
  "events": [
    {
      "type": "feature_click",
      "category": "chat",
      "action": "parallel_mode_toggle",
      "label": "bottom_right_toggle",
      "value": 1,
      "properties": {
        "current_mode": "normal",
        "target_mode": "parallel",
        "user_tier": "free",
        "session_duration": 120, // seconds
        "messages_sent": 3,
        "page_url": "/chat",
        "component": "ChatModeToggle"
      },
      "context": {
        "user_agent": "Mozilla/5.0...",
        "viewport": "1920x1080",
        "connection_type": "wifi",
        "device_memory": 8, // GB
        "timestamp": "2025-08-27T10:00:00Z"
      }
    }
  ]
}
```

#### POST /analytics/page-view
Track page navigation with context
```json
{
  "page": "/chat",
  "title": "R; - Chat",
  "referrer": "/",
  "session_id": "uuid",
  "properties": {
    "load_time": 1200, // ms
    "first_contentful_paint": 800, // ms
    "largest_contentful_paint": 1000, // ms
    "cumulative_layout_shift": 0.1,
    "feature_flags": ["new_ui_v2", "parallel_chat"],
    "a_b_tests": {
      "pricing_modal": "variant_b",
      "onboarding_flow": "control"
    }
  },
  "user_context": {
    "days_since_registration": 7,
    "messages_sent_today": 15,
    "tier": "free",
    "last_upgrade_prompt": "2025-08-26T14:30:00Z"
  }
}
```

### User Behavior Analysis

#### GET /analytics/user-insights
Get ML-generated user insights (Consent Required)
```json
Response:
{
  "behavioral_profile": {
    "user_type": "power_user",
    "confidence": 0.87,
    "characteristics": [
      "frequent_parallel_user",
      "complex_prompt_creator",
      "feature_explorer"
    ],
    "preferences": {
      "session_length": "long", // 15+ minutes
      "response_style": "detailed",
      "topics": ["programming", "ai", "automation"],
      "peak_hours": [9, 10, 14, 15, 16] // 0-23
    }
  },
  "engagement_metrics": {
    "activity_score": 8.5, // 1-10
    "retention_likelihood": 0.92,
    "churn_risk": "low",
    "conversion_likelihood": 0.76,
    "feature_adoption_rate": 0.68
  },
  "recommendations": {
    "next_features": ["agent_crews", "api_access"],
    "upgrade_timing": "optimal_now",
    "content_suggestions": [
      "advanced_prompting_tutorial",
      "parallel_chat_masterclass"
    ]
  }
}
```

### Privacy & GDPR Compliance

#### GET /privacy/data-export
Export all user data (GDPR Article 20)
```json
Response:
{
  "export_id": "uuid",
  "status": "completed",
  "download_url": "https://api.repl-ay.com/exports/user-data-uuid.json",
  "expires_at": "2025-08-28T10:00:00Z",
  "included_data": [
    "profile",
    "chat_sessions",
    "messages",
    "analytics",
    "consents",
    "behavior_patterns"
  ]
}
```

#### POST /privacy/consent
Update consent preferences
```json
{
  "consents": {
    "marketing": {
      "granted": true,
      "updated_at": "2025-08-27T10:00:00Z",
      "method": "settings_page"
    },
    "analytics": {
      "granted": true,
      "updated_at": "2025-08-27T10:00:00Z",
      "method": "settings_page"
    },
    "research": {
      "granted": false,
      "updated_at": "2025-08-27T10:00:00Z",
      "method": "settings_page",
      "withdrawal_reason": "privacy_concerns"
    }
  }
}
```

#### DELETE /privacy/account
Delete account and all data (Right to be Forgotten)
```json
{
  "deletion_reason": "no_longer_needed", // Optional
  "confirm_email": "user@example.com",
  "feedback": "The service didn't meet my needs" // Optional
}
```

## Data Collection Hooks

### Frontend Instrumentation
```javascript
// Comprehensive user interaction tracking
window.analytics = {
  // Mouse tracking (with consent)
  trackMouseMovement: (enabled) => {
    if (enabled) {
      // Track mouse patterns for UX optimization
    }
  },
  
  // Keyboard patterns (anonymized)
  trackTypingPatterns: (enabled) => {
    if (enabled) {
      // Analyze typing speed, pauses for UX insights
    }
  },
  
  // Scroll behavior
  trackScrollBehavior: () => {
    // Track reading patterns, engagement
  },
  
  // Error tracking
  trackErrors: (error) => {
    // Comprehensive error reporting
  },
  
  // Performance monitoring
  trackPerformance: () => {
    // Web vitals, loading times, etc.
  }
}
```

### Server-Side Data Enhancement
```python
# Enrich requests with additional context
def enrich_request_data(request):
    return {
        'ip_address': get_client_ip(request),
        'user_agent': request.headers.get('User-Agent'),
        'accept_language': request.headers.get('Accept-Language'),
        'referer': request.headers.get('Referer'),
        'geo_data': get_geo_from_ip(request), # With consent
        'device_fingerprint': generate_fingerprint(request),
        'session_context': get_session_context(request)
    }
```

## Rate Limiting & Quotas

### By Tier
```json
{
  "curious": {
    "requests_per_minute": 10,
    "messages_per_day": 15,
    "data_export_requests_per_month": 1
  },
  "free": {
    "requests_per_minute": 30,
    "messages_per_day": 50,
    "parallel_instances": 1,
    "data_export_requests_per_month": 2
  },
  "essential": {
    "requests_per_minute": 100,
    "messages_per_day": -1, // unlimited
    "parallel_instances": 3,
    "data_export_requests_per_month": 5
  }
}
```

## Webhook Events

### User Lifecycle Events
```json
{
  "event": "user.upgraded",
  "data": {
    "user_id": "uuid",
    "from_tier": "free",
    "to_tier": "essential",
    "revenue": 12.00,
    "attribution": {
      "last_touch": "pricing_modal",
      "campaign": "parallel_chat_promotion"
    }
  }
}
```

### Data Processing Events
```json
{
  "event": "data.processed",
  "data": {
    "user_id": "uuid",
    "processing_type": "behavior_analysis",
    "insights_generated": ["user_type", "preferences", "predictions"],
    "confidence_score": 0.87
  }
}
```

## Error Tracking & Monitoring

### Error Response Format
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "limit": 30,
      "remaining": 0,
      "reset_at": "2025-08-27T10:01:00Z"
    },
    "tracking_id": "uuid"
  }
}
```

### Performance Monitoring
- Response time tracking
- Database query analysis  
- Memory usage patterns
- Error rate monitoring
- User session recordings (with consent)