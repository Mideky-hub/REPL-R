-- Add crew_definitions table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS crew_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    agents JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER crew_definitions_update_updated_at 
    BEFORE UPDATE ON crew_definitions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Add some sample data
INSERT INTO crew_definitions (name, description, agents, connections) VALUES
    ('Content Creation Crew', 'A crew specialized in creating engaging content', 
     '[{"id": "researcher", "role": "Researcher", "department": "research", "goal": "Research topics thoroughly", "backstory": "Expert researcher with deep knowledge"}]',
     '[]'),
    ('Marketing Team', 'Marketing and social media management crew',
     '[{"id": "marketer", "role": "Marketing Specialist", "department": "marketing", "goal": "Create marketing strategies", "backstory": "Creative marketing professional"}]',
     '[]')
ON CONFLICT DO NOTHING;
