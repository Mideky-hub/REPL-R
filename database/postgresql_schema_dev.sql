-- REPL;ay Database Schema (Development Version)
-- This is a simplified version without Supabase-specific auth functions

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate types for clean initialization
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE alert_type AS ENUM ('cost_threshold', 'error_rate', 'performance', 'custom');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- Tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- Insert sample data for development
INSERT INTO organizations (id, name, slug) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'REPL;ay Demo', 'repl-ay-demo'),
    ('550e8400-e29b-41d4-a716-446655440002', 'AI Startup Inc', 'ai-startup-inc'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Enterprise Corp', 'enterprise-corp')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    channels JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_environments_project_id ON environments(project_id);
CREATE INDEX idx_alerts_org_id ON alerts(organization_id);
CREATE INDEX idx_alerts_project_id ON alerts(project_id);
CREATE INDEX idx_alert_incidents_alert_id ON alert_incidents(alert_id);

-- Foreign key constraints
ALTER TABLE organization_members ADD CONSTRAINT fk_org_members_org FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE organization_members ADD CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_org FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE api_keys ADD CONSTRAINT fk_api_keys_org FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE api_keys ADD CONSTRAINT fk_api_keys_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE environments ADD CONSTRAINT fk_environments_project FOREIGN KEY (project_id) REFERENCES projects(id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER organizations_update_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER users_update_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER organization_members_update_updated_at 
    BEFORE UPDATE ON organization_members 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER projects_update_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER api_keys_update_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER environments_update_updated_at 
    BEFORE UPDATE ON environments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER alerts_update_updated_at 
    BEFORE UPDATE ON alerts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
