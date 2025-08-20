"""
Traces API endpoints - Analytics and visualization for execution traces
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from enum import Enum

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..auth import get_api_key
from ..database import get_clickhouse_client

logger = structlog.get_logger()

router = APIRouter()


class TimeRange(str, Enum):
    HOUR = "1h"
    DAY = "24h"
    WEEK = "7d"
    MONTH = "30d"


class MetricType(str, Enum):
    TOKENS = "tokens"
    COST = "cost"
    LATENCY = "latency"
    EXECUTIONS = "executions"


class TraceStatus(str, Enum):
    COMPLETED = "completed"
    FAILED = "failed" 
    RUNNING = "running"
    CANCELLED = "cancelled"


# Response Models
class DashboardMetrics(BaseModel):
    total_traces: int
    active_agents: int
    total_cost: float
    avg_latency: float
    period: str


class TokenUsagePoint(BaseModel):
    timestamp: datetime
    tokens: int


class CostBreakdownItem(BaseModel):
    model_name: str
    cost: float
    percentage: float
    color: str


class TraceListItem(BaseModel):
    id: str
    name: str
    start_time: datetime
    duration: int  # milliseconds
    status: TraceStatus
    agents: int
    tasks: int
    tokens: int
    cost: float
    environment: str


class AgentCommunication(BaseModel):
    timestamp: datetime
    from_agent: str
    to_agent: str
    message_type: str
    content: str


class LLMCall(BaseModel):
    timestamp: datetime
    agent_id: str
    model_name: str
    prompt_tokens: int
    completion_tokens: int
    cost: float
    latency_ms: int
    prompt: str
    response: str


class TraceDetail(BaseModel):
    id: str
    name: str
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[int]
    status: TraceStatus
    environment: str
    total_cost: float
    total_tokens: int
    agents_count: int
    tasks_count: int
    timeline: List[Dict[str, Any]]
    agent_communications: List[AgentCommunication]
    llm_calls: List[LLMCall]
    metadata: Dict[str, Any]


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    project_id: str = Query(..., description="Project ID"),
    time_range: TimeRange = Query(TimeRange.DAY, description="Time range for metrics"),
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client)
) -> DashboardMetrics:
    """
    Get high-level dashboard metrics for the project
    """
    try:
        # Calculate time bounds
        now = datetime.utcnow()
        if time_range == TimeRange.HOUR:
            start_time = now - timedelta(hours=1)
        elif time_range == TimeRange.DAY:
            start_time = now - timedelta(days=1)
        elif time_range == TimeRange.WEEK:
            start_time = now - timedelta(weeks=1)
        else:  # MONTH
            start_time = now - timedelta(days=30)

        # Query for metrics
        metrics_query = """
        SELECT 
            uniq(trace_id) as total_traces,
            uniq(agent_id) as active_agents,
            sum(cost_usd) as total_cost,
            avg(latency_ms) as avg_latency
        FROM telemetry_events
        WHERE project_id = %(project_id)s
        AND timestamp >= %(start_time)s
        AND timestamp <= %(end_time)s
        """

        result = await clickhouse.execute(
            metrics_query,
            {
                "project_id": project_id,
                "start_time": start_time.isoformat(),
                "end_time": now.isoformat()
            }
        )

        if not result:
            return DashboardMetrics(
                total_traces=0,
                active_agents=0, 
                total_cost=0.0,
                avg_latency=0.0,
                period=time_range.value
            )

        metrics = result[0]
        return DashboardMetrics(
            total_traces=metrics["total_traces"] or 0,
            active_agents=metrics["active_agents"] or 0,
            total_cost=round(metrics["total_cost"] or 0, 2),
            avg_latency=round(metrics["avg_latency"] or 0, 2),
            period=time_range.value
        )

    except Exception as e:
        logger.error("Failed to get dashboard metrics", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard metrics")


@router.get("/token-usage", response_model=List[TokenUsagePoint])
async def get_token_usage_chart(
    project_id: str = Query(..., description="Project ID"),
    time_range: TimeRange = Query(TimeRange.DAY, description="Time range for chart"),
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client)
) -> List[TokenUsagePoint]:
    """
    Get token usage over time for charts
    """
    try:
        # Calculate time bounds and interval
        now = datetime.utcnow()
        if time_range == TimeRange.HOUR:
            start_time = now - timedelta(hours=1)
            interval = "toStartOfMinute(timestamp)"
        elif time_range == TimeRange.DAY:
            start_time = now - timedelta(days=1)
            interval = "toStartOfHour(timestamp)"
        elif time_range == TimeRange.WEEK:
            start_time = now - timedelta(weeks=1)
            interval = "toStartOfDay(timestamp)"
        else:  # MONTH
            start_time = now - timedelta(days=30)
            interval = "toStartOfDay(timestamp)"

        query = f"""
        SELECT 
            {interval} as time_bucket,
            sum(tokens_used) as tokens
        FROM telemetry_events
        WHERE project_id = %(project_id)s
        AND timestamp >= %(start_time)s
        AND timestamp <= %(end_time)s
        AND tokens_used > 0
        GROUP BY time_bucket
        ORDER BY time_bucket
        """

        result = await clickhouse.execute(
            query,
            {
                "project_id": project_id,
                "start_time": start_time.isoformat(),
                "end_time": now.isoformat()
            }
        )

        return [
            TokenUsagePoint(
                timestamp=row["time_bucket"],
                tokens=row["tokens"] or 0
            )
            for row in result
        ]

    except Exception as e:
        logger.error("Failed to get token usage chart", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch token usage data")


@router.get("/cost-breakdown", response_model=List[CostBreakdownItem])
async def get_cost_breakdown(
    project_id: str = Query(..., description="Project ID"),
    time_range: TimeRange = Query(TimeRange.DAY, description="Time range for breakdown"),
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client)
) -> List[CostBreakdownItem]:
    """
    Get cost breakdown by model for pie chart
    """
    try:
        # Calculate time bounds
        now = datetime.utcnow()
        if time_range == TimeRange.HOUR:
            start_time = now - timedelta(hours=1)
        elif time_range == TimeRange.DAY:
            start_time = now - timedelta(days=1)
        elif time_range == TimeRange.WEEK:
            start_time = now - timedelta(weeks=1)
        else:  # MONTH
            start_time = now - timedelta(days=30)

        query = """
        WITH model_costs AS (
            SELECT 
                coalesce(model_name, 'Unknown') as model,
                sum(cost_usd) as cost
            FROM telemetry_events
            WHERE project_id = %(project_id)s
            AND timestamp >= %(start_time)s
            AND timestamp <= %(end_time)s
            AND cost_usd > 0
            GROUP BY model_name
        ),
        total_cost AS (
            SELECT sum(cost) as total FROM model_costs
        )
        SELECT 
            model,
            cost,
            (cost / total.total) * 100 as percentage
        FROM model_costs
        CROSS JOIN total_cost as total
        ORDER BY cost DESC
        """

        result = await clickhouse.execute(
            query,
            {
                "project_id": project_id,
                "start_time": start_time.isoformat(),
                "end_time": now.isoformat()
            }
        )

        # Model color mapping
        model_colors = {
            "gpt-4": "#3b82f6",
            "gpt-3.5-turbo": "#10b981",
            "claude": "#f59e0b",
            "gemini": "#8b5cf6",
            "llama": "#ef4444"
        }

        breakdown = []
        for i, row in enumerate(result):
            model = row["model"].lower()
            color = model_colors.get(model, f"#6b7280")  # Default gray
            
            breakdown.append(CostBreakdownItem(
                model_name=row["model"],
                cost=round(row["cost"], 2),
                percentage=round(row["percentage"], 1),
                color=color
            ))

        return breakdown

    except Exception as e:
        logger.error("Failed to get cost breakdown", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch cost breakdown")


@router.get("/recent", response_model=List[TraceListItem])
async def get_recent_traces(
    project_id: str = Query(..., description="Project ID"),
    limit: int = Query(20, description="Number of traces to return"),
    offset: int = Query(0, description="Offset for pagination"),
    environment: Optional[str] = Query(None, description="Filter by environment"),
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client)
) -> List[TraceListItem]:
    """
    Get recent traces for the traces table
    """
    try:
        # Build WHERE clause
        where_conditions = ["project_id = %(project_id)s"]
        params = {"project_id": project_id}

        if environment:
            where_conditions.append("environment = %(environment)s")
            params["environment"] = environment

        where_clause = " AND ".join(where_conditions)

        query = f"""
        SELECT 
            trace_id,
            any(session_id) as session_name,
            min(timestamp) as start_time,
            max(timestamp) - min(timestamp) as duration_ms,
            CASE 
                WHEN countIf(event_type LIKE '%.error') > 0 THEN 'failed'
                WHEN countIf(event_type LIKE '%.start') > countIf(event_type LIKE '%.end') THEN 'running'
                ELSE 'completed'
            END as status,
            uniq(agent_id) as agents_count,
            uniq(task_id) as tasks_count,
            sum(tokens_used) as total_tokens,
            sum(cost_usd) as total_cost,
            any(environment) as env
        FROM telemetry_events
        WHERE {where_clause}
        GROUP BY trace_id
        ORDER BY start_time DESC
        LIMIT %(limit)s OFFSET %(offset)s
        """

        params.update({"limit": limit, "offset": offset})
        result = await clickhouse.execute(query, params)

        traces = []
        for row in result:
            status_value = row["status"]
            if status_value not in [s.value for s in TraceStatus]:
                status_value = TraceStatus.COMPLETED.value

            traces.append(TraceListItem(
                id=row["trace_id"],
                name=row["session_name"] or f"Trace {row['trace_id'][:8]}",
                start_time=row["start_time"],
                duration=int(row["duration_ms"]),
                status=TraceStatus(status_value),
                agents=row["agents_count"] or 0,
                tasks=row["tasks_count"] or 0,
                tokens=row["total_tokens"] or 0,
                cost=round(row["total_cost"] or 0, 2),
                environment=row["env"] or "unknown"
            ))

        return traces

    except Exception as e:
        logger.error("Failed to get recent traces", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch recent traces")


@router.get("/{trace_id}", response_model=TraceDetail)
async def get_trace_detail(
    trace_id: str,
    project_id: str = Query(..., description="Project ID"),
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client)
) -> TraceDetail:
    """
    Get detailed information about a specific trace
    """
    try:
        # Get trace summary
        summary_query = """
        SELECT 
            trace_id,
            any(session_id) as session_name,
            min(timestamp) as start_time,
            max(timestamp) as end_time,
            max(timestamp) - min(timestamp) as duration_ms,
            CASE 
                WHEN countIf(event_type LIKE '%.error') > 0 THEN 'failed'
                WHEN countIf(event_type LIKE '%.start') > countIf(event_type LIKE '%.end') THEN 'running'
                ELSE 'completed'
            END as status,
            any(environment) as environment,
            sum(cost_usd) as total_cost,
            sum(tokens_used) as total_tokens,
            uniq(agent_id) as agents_count,
            uniq(task_id) as tasks_count
        FROM telemetry_events
        WHERE project_id = %(project_id)s AND trace_id = %(trace_id)s
        GROUP BY trace_id
        """

        summary_result = await clickhouse.execute(
            summary_query,
            {"project_id": project_id, "trace_id": trace_id}
        )

        if not summary_result:
            raise HTTPException(status_code=404, detail="Trace not found")

        trace_summary = summary_result[0]

        # Get timeline events
        timeline_query = """
        SELECT 
            timestamp,
            event_type,
            agent_id,
            agent_name,
            task_id,
            task_name,
            tool_name,
            model_name,
            tokens_used,
            cost_usd,
            latency_ms,
            execution_time_ms,
            status,
            error_message,
            raw_data
        FROM telemetry_events
        WHERE project_id = %(project_id)s AND trace_id = %(trace_id)s
        ORDER BY timestamp ASC
        """

        timeline_result = await clickhouse.execute(
            timeline_query,
            {"project_id": project_id, "trace_id": trace_id}
        )

        # Process timeline data
        timeline = []
        agent_communications = []
        llm_calls = []

        for event in timeline_result:
            timeline_item = {
                "timestamp": event["timestamp"],
                "type": event["event_type"],
                "agent_id": event["agent_id"],
                "agent_name": event["agent_name"],
                "task_id": event["task_id"],
                "task_name": event["task_name"],
                "tool_name": event["tool_name"],
                "duration_ms": event["execution_time_ms"] or event["latency_ms"],
                "status": event["status"],
                "error": event["error_message"],
                "metadata": event["raw_data"]
            }
            timeline.append(timeline_item)

            # Extract LLM calls
            if event["event_type"] in ["llm.start", "llm.end"] and event["model_name"]:
                llm_calls.append(LLMCall(
                    timestamp=event["timestamp"],
                    agent_id=event["agent_id"] or "unknown",
                    model_name=event["model_name"],
                    prompt_tokens=0,  # Would need to parse from raw_data
                    completion_tokens=event["tokens_used"] or 0,
                    cost=event["cost_usd"] or 0,
                    latency_ms=event["latency_ms"] or 0,
                    prompt="",  # Would need to extract from raw_data
                    response=""  # Would need to extract from raw_data
                ))

        status_value = trace_summary["status"]
        if status_value not in [s.value for s in TraceStatus]:
            status_value = TraceStatus.COMPLETED.value

        return TraceDetail(
            id=trace_id,
            name=trace_summary["session_name"] or f"Trace {trace_id[:8]}",
            start_time=trace_summary["start_time"],
            end_time=trace_summary["end_time"],
            duration=int(trace_summary["duration_ms"]),
            status=TraceStatus(status_value),
            environment=trace_summary["environment"] or "unknown",
            total_cost=round(trace_summary["total_cost"] or 0, 2),
            total_tokens=trace_summary["total_tokens"] or 0,
            agents_count=trace_summary["agents_count"] or 0,
            tasks_count=trace_summary["tasks_count"] or 0,
            timeline=timeline,
            agent_communications=agent_communications,
            llm_calls=llm_calls,
            metadata={}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get trace detail", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch trace details")
