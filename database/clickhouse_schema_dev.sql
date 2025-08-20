-- ClickHouse schema for telemetry events (Development Version)
-- This is a simplified version for local development

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
    
    -- Raw data (for flexibility)
    raw_data String,
    
    -- Metadata
    status Nullable(String),
    error_message Nullable(String)
    
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (project_id, timestamp, trace_id, span_id)
TTL timestamp + INTERVAL 90 DAY;

-- Simplified materialized view for aggregated metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_metrics_hourly
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (project_id, environment, hour, event_type)
AS SELECT
    project_id,
    environment,
    toStartOfHour(timestamp) as hour,
    event_type,
    count() as event_count,
    sum(tokens_used) as total_tokens,
    sum(cost_usd) as total_cost,
    avg(latency_ms) as avg_latency
FROM telemetry_events
GROUP BY project_id, environment, hour, event_type;

-- Simple view for cost metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS cost_metrics_daily
ENGINE = AggregatingMergeTree()  
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, environment, date, model_name)
AS SELECT
    project_id,
    environment,
    toDate(timestamp) as date,
    model_name,
    sum(cost_usd) as daily_cost,
    sum(tokens_used) as daily_tokens,
    count() as daily_requests
FROM telemetry_events
WHERE event_type IN ('llm.end')
GROUP BY project_id, environment, date, model_name;

-- Performance metrics view  
CREATE MATERIALIZED VIEW IF NOT EXISTS performance_metrics_daily
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, environment, date)
AS SELECT
    project_id,
    environment,
    toDate(timestamp) as date,
    avg(latency_ms) as avg_latency,
    max(latency_ms) as max_latency,
    quantile(0.95)(latency_ms) as p95_latency,
    quantile(0.99)(latency_ms) as p99_latency,
    count() as total_requests
FROM telemetry_events
WHERE latency_ms IS NOT NULL
GROUP BY project_id, environment, date;
