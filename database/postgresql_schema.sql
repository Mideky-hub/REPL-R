-- PostgreSQL schema for user management and application data

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color for UI
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(organization_id, slug)
);

-- API Keys table  
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for display
    key_hash VARCHAR(255) NOT NULL, -- Hashed key for verification
    scopes TEXT[] DEFAULT ARRAY['events:write'], -- Permissions
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    UNIQUE(key_hash)
);

-- Environments table
CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10b981',
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, slug)
);

-- Insert default environments for new projects
INSERT INTO environments (project_id, name, slug, description) VALUES
    (NULL, 'Production', 'production', 'Production environment'),
    (NULL, 'Staging', 'staging', 'Staging environment'),
    (NULL, 'Development', 'development', 'Development environment');

-- Crew definitions (Studio feature)
CREATE TABLE IF NOT EXISTS crew_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    config JSONB NOT NULL, -- Complete crew configuration including agents and connections
    canvas_state JSONB, -- Canvas position, zoom, etc.
    is_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew execution history (Studio runs)
CREATE TABLE IF NOT EXISTS crew_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_definition_id UUID REFERENCES crew_definitions(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL, -- Links to telemetry data
    execution_id VARCHAR(255) NOT NULL, -- Links to telemetry data
    trace_id VARCHAR(255) NOT NULL, -- Links to telemetry data
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'running', -- idle, running, completed, failed
    input_data JSONB,
    output_data JSONB,
    model_config JSONB,
    metrics JSONB, -- tokens, cost, duration, etc.
    started_by UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Tools catalog (available tools for agents)
CREATE TABLE IF NOT EXISTS tools_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100), -- search, database, file, communication, analysis, other
    icon VARCHAR(100),
    config_schema JSONB, -- JSON schema for tool configuration
    is_builtin BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert built-in tools
INSERT INTO tools_catalog (name, slug, description, category, icon, is_builtin) VALUES
    ('Web Search', 'web-search', 'Search the internet for information', 'search', 'search', true),
    ('Database Query', 'database-query', 'Query databases for data', 'database', 'database', true),
    ('File Reader', 'file-read', 'Read content from files', 'file', 'file-text', true),
    ('File Writer', 'file-write', 'Write content to files', 'file', 'file-text', true),
    ('API Call', 'api-call', 'Make HTTP API requests', 'communication', 'globe', true),
    ('Email Sender', 'email-send', 'Send emails', 'communication', 'mail', true),
    ('Data Analysis', 'data-analysis', 'Analyze and process data', 'analysis', 'trending-up', true),
    ('Image Generator', 'image-generation', 'Generate images using AI', 'other', 'image', true);

-- Agent templates (reusable agent configurations)
CREATE TABLE IF NOT EXISTS agent_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role VARCHAR(255) NOT NULL,
    goal TEXT NOT NULL,
    backstory TEXT NOT NULL,
    system_prompt TEXT,
    default_tools TEXT[], -- Array of tool slugs
    category VARCHAR(100), -- research, analysis, writing, communication, etc.
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    is_builtin BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert built-in agent templates
INSERT INTO agent_templates (name, description, role, goal, backstory, default_tools, category, is_builtin, is_public) VALUES
    ('Research Agent', 'Specialized in gathering and analyzing information', 'Senior Research Specialist', 'Gather comprehensive information on given topics and provide structured analysis', 'You are an experienced researcher with expertise in finding credible sources and analyzing information from multiple perspectives.', ARRAY['web-search', 'database-query'], 'research', true, true),
    ('Data Analyst', 'Expert in data processing and insights', 'Senior Data Analyst', 'Analyze data sets and provide actionable insights with clear visualizations', 'You are a skilled data analyst with experience in statistical analysis, pattern recognition, and creating meaningful reports.', ARRAY['data-analysis', 'file-read'], 'analysis', true, true),
    ('Content Writer', 'Professional content creation and editing', 'Content Writing Specialist', 'Create engaging, well-structured content tailored to the target audience', 'You are a professional writer with expertise in various content formats and excellent command of language.', ARRAY['web-search', 'file-write'], 'writing', true, true),
    ('Communication Coordinator', 'Manages external communications and outreach', 'Communications Manager', 'Handle external communications, send emails, and coordinate with stakeholders', 'You are an experienced communications professional skilled in stakeholder management and professional correspondence.', ARRAY['email-send', 'api-call'], 'communication', true, true);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition JSONB NOT NULL, -- Alert condition configuration
    channels TEXT[] NOT NULL, -- email, slack, webhook
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert incidents
CREATE TABLE IF NOT EXISTS alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'open', -- open, resolved, suppressed
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

-- Usage tracking for billing
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL, -- events, storage_mb, api_calls, crew_executions
    value BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_environments_project_id ON environments(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_org_id_metric ON usage_records(organization_id, metric, recorded_at);

-- Studio-specific indexes
CREATE INDEX IF NOT EXISTS idx_crew_definitions_project_id ON crew_definitions(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_executions_project_id ON crew_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_executions_definition_id ON crew_executions(crew_definition_id);
CREATE INDEX IF NOT EXISTS idx_crew_executions_session_id ON crew_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_crew_executions_execution_id ON crew_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_project_id ON agent_templates(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

-- Policies (simplified for development)
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_crew_definitions_updated_at 
    BEFORE UPDATE ON crew_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_agent_templates_updated_at 
    BEFORE UPDATE ON agent_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create default environments for new projects
CREATE OR REPLACE FUNCTION create_default_environments_for_project()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO environments (project_id, name, slug, description, color) VALUES
        (NEW.id, 'Production', 'production', 'Production environment', '#ef4444'),
        (NEW.id, 'Staging', 'staging', 'Staging environment', '#f59e0b'),
        (NEW.id, 'Development', 'development', 'Development environment', '#10b981'),
        (NEW.id, 'Studio', 'studio', 'Studio crew executions', '#8b5cf6');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create environments for new projects
CREATE TRIGGER create_environments_for_new_project
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION create_default_environments_for_project();
