"""
Events ingestion endpoint - the core telemetry collection API
"""

import time
from datetime import datetime
from typing import Any, Dict, List
from uuid import uuid4

import structlog
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from ..auth import get_api_key
from ..database import get_clickhouse_client
from ..models.events import EventBatch, TelemetryEvent

logger = structlog.get_logger()

router = APIRouter()


class EventRequest(BaseModel):
    """Request payload for event ingestion"""
    events: List[Dict[str, Any]] = Field(..., description="List of telemetry events")
    session_id: str = Field(..., description="Session identifier")
    project_id: str = Field(..., description="Project identifier")
    environment: str = Field(default="production", description="Environment name")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class EventResponse(BaseModel):
    """Response for event ingestion"""
    success: bool
    events_received: int
    batch_id: str
    message: str


@router.post("/", response_model=EventResponse)
async def ingest_events(
    request: EventRequest,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client),
) -> EventResponse:
    """
    Ingest telemetry events from SDK clients
    
    This is the main endpoint for collecting observability data from instrumented
    AI agent applications. Events are batched and processed asynchronously.
    """
    start_time = time.time()
    batch_id = str(uuid4())
    
    try:
        logger.info(
            "Receiving event batch",
            batch_id=batch_id,
            events_count=len(request.events),
            project_id=request.project_id,
            session_id=request.session_id,
            environment=request.environment,
        )
        
        # Validate and parse events
        parsed_events = []
        for i, event_data in enumerate(request.events):
            try:
                # Add metadata to each event
                event_data.update({
                    "batch_id": batch_id,
                    "api_key_hash": hash(api_key),  # Don't store the actual key
                    "ingested_at": datetime.utcnow().isoformat(),
                    "project_id": request.project_id,
                    "session_id": request.session_id,
                    "environment": request.environment,
                })
                
                parsed_events.append(event_data)
                
            except Exception as e:
                logger.warning(
                    "Failed to parse event",
                    batch_id=batch_id,
                    event_index=i,
                    error=str(e),
                )
                continue
        
        if not parsed_events:
            raise HTTPException(
                status_code=400,
                detail="No valid events found in batch"
            )
        
        # Store events asynchronously
        background_tasks.add_task(
            store_events_batch,
            parsed_events,
            batch_id,
            clickhouse,
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(
            "Event batch accepted",
            batch_id=batch_id,
            events_stored=len(parsed_events),
            processing_time_ms=processing_time,
        )
        
        return EventResponse(
            success=True,
            events_received=len(parsed_events),
            batch_id=batch_id,
            message=f"Successfully queued {len(parsed_events)} events for processing",
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to ingest events",
            batch_id=batch_id,
            error=str(e),
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to process event batch"
        )


async def store_events_batch(
    events: List[Dict[str, Any]],
    batch_id: str,
    clickhouse_client,
) -> None:
    """
    Store events batch in ClickHouse database
    
    This function runs in the background to avoid blocking the API response.
    """
    try:
        logger.info(
            "Storing event batch",
            batch_id=batch_id,
            events_count=len(events),
        )
        
        # Prepare data for ClickHouse insertion
        rows = []
        for event in events:
            # Flatten the event data for ClickHouse columns
            row = {
                "batch_id": batch_id,
                "event_id": event.get("event_id", str(uuid4())),
                "event_type": event.get("event_type"),
                "timestamp": event.get("timestamp", datetime.utcnow().isoformat()),
                "trace_id": event.get("trace_context", {}).get("trace_id"),
                "span_id": event.get("trace_context", {}).get("span_id"),
                "parent_span_id": event.get("trace_context", {}).get("parent_span_id"),
                "session_id": event.get("session_id"),
                "project_id": event.get("project_id"),
                "environment": event.get("environment"),
                "api_key_hash": event.get("api_key_hash"),
                "ingested_at": event.get("ingested_at"),
                "raw_data": event,  # Store full event as JSON
            }
            
            # Add event-specific fields
            if "agent_id" in event:
                row.update({
                    "agent_id": event["agent_id"],
                    "agent_name": event.get("agent_name"),
                    "agent_role": event.get("agent_role"),
                })
            
            if "task_id" in event:
                row.update({
                    "task_id": event["task_id"],
                    "task_name": event.get("task_name"),
                })
            
            if "tool_name" in event:
                row.update({
                    "tool_name": event["tool_name"],
                    "execution_time_ms": event.get("execution_time_ms"),
                })
            
            if "model_name" in event:
                row.update({
                    "model_name": event["model_name"],
                    "tokens_used": event.get("tokens_used"),
                    "cost_usd": event.get("cost_usd"),
                    "latency_ms": event.get("latency_ms"),
                })
            
            rows.append(row)
        
        # Insert into ClickHouse
        await clickhouse_client.insert_batch("telemetry_events", rows)
        
        logger.info(
            "Successfully stored event batch",
            batch_id=batch_id,
            events_stored=len(rows),
        )
        
    except Exception as e:
        logger.error(
            "Failed to store event batch",
            batch_id=batch_id,
            error=str(e),
            exc_info=True,
        )
        # In a production system, you might want to:
        # - Retry the operation
        # - Store in a dead letter queue
        # - Alert monitoring systems


@router.get("/batch/{batch_id}")
async def get_batch_status(
    batch_id: str,
    api_key: str = Depends(get_api_key),
    clickhouse = Depends(get_clickhouse_client),
) -> Dict[str, Any]:
    """
    Get the status of a specific event batch
    """
    try:
        # Query ClickHouse for batch information
        query = """
        SELECT 
            count() as events_count,
            min(timestamp) as first_event_time,
            max(timestamp) as last_event_time,
            uniq(event_type) as event_types_count,
            groupUniqArray(event_type) as event_types,
            uniq(trace_id) as unique_traces
        FROM telemetry_events 
        WHERE batch_id = %(batch_id)s
        """
        
        result = await clickhouse_client.execute(
            query,
            {"batch_id": batch_id}
        )
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail="Batch not found"
            )
        
        batch_info = result[0]
        
        return {
            "batch_id": batch_id,
            "status": "processed" if batch_info["events_count"] > 0 else "not_found",
            "events_count": batch_info["events_count"],
            "first_event_time": batch_info["first_event_time"],
            "last_event_time": batch_info["last_event_time"], 
            "event_types": batch_info["event_types"],
            "unique_traces": batch_info["unique_traces"],
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to get batch status",
            batch_id=batch_id,
            error=str(e),
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve batch status"
        )
