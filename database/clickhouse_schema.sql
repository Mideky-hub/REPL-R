-- ClickHouse schema for telemetry events
-- This is the main table for storing all observability data

CREATE TABLE IF NOT EXISTS telemetry_events (
    -- Event identification
    batch_id String,
    event_id String,
    event_type Enum('agent.start' = 1, 'agent.end' = 2, 'agent.error' = 3, 
                    'task.start' = 4, 'task.end' = 5, 'task.error' = 6,
                    'tool.start' = 7, 'tool.end' = 8, 'tool.error' = 9,
                    'llm.start' = 10, 'llm.end' = 11, 'llm.error' = 12,
                    'crew.start' = 13, 'crew.end' = 14, 'crew.error' = 15),
    
    -- Timing
    timestamp DateTime64(3),
    ingested_at DateTime64(3),
    
    -- Tracing context
    trace_id String,
    span_id String,
    parent_span_id Nullable(String),
    session_id String,
    
    -- Organization
    project_id String,
    environment String,
    api_key_hash UInt64,
    
    -- Agent-specific fields
    agent_id Nullable(String),
    agent_name Nullable(String),
    agent_role Nullable(String),
    
    -- Task-specific fields  
    task_id Nullable(String),
    task_name Nullable(String),
    
    -- Tool-specific fields
    tool_name Nullable(String),
    execution_time_ms Nullable(UInt32),
    
    -- LLM-specific fields
    model_name Nullable(String),
    tokens_used Nullable(UInt32),
    cost_usd Nullable(Float32),
    latency_ms Nullable(UInt32),
    
    -- Crew-specific fields (Studio integration)
    crew_id Nullable(String),
    execution_id Nullable(String),
    
    -- Raw data (for flexibility)
    raw_data String,
    
    -- Metadata
    status Nullable(String),
    error_message Nullable(String)
    
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (project_id, timestamp, trace_id, span_id)
TTL timestamp + INTERVAL 90 DAY;

-- Materialized view for aggregated metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_metrics_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (project_id, environment, hour, event_type)
POPULATE
AS SELECT
    project_id,
    environment,
    toStartOfHour(timestamp) as hour,
    event_type,
    count() as event_count,
    sum(tokens_used) as total_tokens,
    sum(cost_usd) as total_cost,
    avg(latency_ms) as avg_latency_ms,
    avg(execution_time_ms) as avg_execution_time_ms
FROM telemetry_events
GROUP BY project_id, environment, hour, event_type;

-- Materialized view for traces summary
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_summaries  
ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(start_time)
ORDER BY (project_id, trace_id)
POPULATE
AS SELECT
    project_id,
    environment,
    trace_id,
    session_id,
    any(crew_id) as crew_id,
    any(execution_id) as execution_id,
    min(timestamp) as start_time,
    max(timestamp) as end_time,
    max(timestamp) - min(timestamp) as duration_ms,
    uniq(agent_id) as unique_agents,
    uniq(task_id) as unique_tasks,
    uniq(tool_name) as unique_tools,
    sum(tokens_used) as total_tokens,
    sum(cost_usd) as total_cost,
    countIf(event_type LIKE '%error%') as error_count,
    countIf(event_type LIKE '%start%') as start_count,
    countIf(event_type LIKE '%end%') as end_count,
    max(timestamp) as updated_at
FROM telemetry_events
GROUP BY project_id, environment, trace_id, session_id;

-- Materialized view for crew execution summaries (Studio specific)
CREATE MATERIALIZED VIEW IF NOT EXISTS crew_execution_summaries
ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(start_time)
ORDER BY (project_id, crew_id, execution_id)
POPULATE
AS SELECT
    project_id,
    crew_id,
    execution_id,
    any(trace_id) as trace_id,
    any(session_id) as session_id,
    min(timestamp) as start_time,
    max(timestamp) as end_time,
    max(timestamp) - min(timestamp) as duration_ms,
    uniq(agent_id) as agents_count,
    sum(tokens_used) as total_tokens,
    sum(cost_usd) as total_cost,
    countIf(event_type = 'crew.error') as has_errors,
    CASE 
        WHEN countIf(event_type = 'crew.error') > 0 THEN 'error'
        WHEN countIf(event_type = 'crew.start') > countIf(event_type = 'crew.end') THEN 'running'
        ELSE 'completed'
    END as status,
    max(timestamp) as updated_at
FROM telemetry_events
WHERE crew_id IS NOT NULL AND execution_id IS NOT NULL
GROUP BY project_id, crew_id, execution_id;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_trace_id ON telemetry_events (trace_id) TYPE bloom_filter GRANULARITY 1;
CREATE INDEX IF NOT EXISTS idx_agent_id ON telemetry_events (agent_id) TYPE bloom_filter GRANULARITY 1;
CREATE INDEX IF NOT EXISTS idx_task_id ON telemetry_events (task_id) TYPE bloom_filter GRANULARITY 1;
CREATE INDEX IF NOT EXISTS idx_crew_id ON telemetry_events (crew_id) TYPE bloom_filter GRANULARITY 1;
CREATE INDEX IF NOT EXISTS idx_execution_id ON telemetry_events (execution_id) TYPE bloom_filter GRANULARITY 1;
