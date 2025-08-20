-- ClickHouse schema for telemetry events (Simple Development Version)
-- Minimal schema for local development without complex materialized views

CREATE TABLE IF NOT EXISTS telemetry_events (
    -- Event identification
    batch_id String,
    event_id String,
    event_type Enum('agent.start' = 1, 'agent.end' = 2, 'agent.error' = 3, 
                    'task.start' = 4, 'task.end' = 5, 'task.error' = 6,
                    'tool.start' = 7, 'tool.end' = 8, 'tool.error' = 9,
                    'llm.start' = 10, 'llm.end' = 11, 'llm.error' = 12),
    
    -- Timing - Using DateTime for TTL compatibility
    timestamp DateTime,
    timestamp_ms DateTime64(3),  -- For precise millisecond timestamps
    ingested_at DateTime DEFAULT NOW(),
    
    -- Tracing context
    trace_id String,
    span_id String,
    parent_span_id String DEFAULT '',  -- Non-nullable
    session_id String,
    
    -- Organization
    project_id String,
    environment String,
    api_key_hash UInt64,
    
    -- Agent-specific fields
    agent_id String DEFAULT '',
    agent_name String DEFAULT '',
    agent_role String DEFAULT '',
    
    -- Task-specific fields
    task_id String DEFAULT '',
    task_name String DEFAULT '',
    
    -- Tool-specific fields
    tool_name String DEFAULT '',
    execution_time_ms UInt32 DEFAULT 0,
    
    -- LLM-specific fields
    model_name String DEFAULT '',
    tokens_used UInt32 DEFAULT 0,
    cost_usd Float32 DEFAULT 0.0,
    latency_ms UInt32 DEFAULT 0,
    
    -- Raw data (for flexibility)
    raw_data String DEFAULT '',
    
    -- Metadata
    status String DEFAULT '',
    error_message String DEFAULT ''
    
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (project_id, timestamp, trace_id, span_id)
TTL timestamp + INTERVAL 90 DAY;
