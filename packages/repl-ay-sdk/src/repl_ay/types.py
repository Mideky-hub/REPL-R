"""
Core types and data models for REPL;ay telemetry
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Types of events that can be tracked"""
    AGENT_START = "agent.start"
    AGENT_END = "agent.end"
    AGENT_ERROR = "agent.error"
    TASK_START = "task.start"
    TASK_END = "task.end"
    TASK_ERROR = "task.error"
    TOOL_START = "tool.start"
    TOOL_END = "tool.end"
    TOOL_ERROR = "tool.error"
    LLM_START = "llm.start"
    LLM_END = "llm.end"
    LLM_ERROR = "llm.error"


class TraceContext(BaseModel):
    """Context information for tracing"""
    trace_id: str = Field(..., description="Unique identifier for the entire trace")
    span_id: str = Field(..., description="Unique identifier for this span")
    parent_span_id: Optional[str] = Field(None, description="Parent span identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")
    user_id: Optional[str] = Field(None, description="User identifier")


class BaseEvent(BaseModel):
    """Base class for all telemetry events"""
    event_id: str = Field(..., description="Unique event identifier")
    event_type: EventType = Field(..., description="Type of event")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trace_context: TraceContext = Field(..., description="Trace context")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentEvent(BaseEvent):
    """Event for agent-related activities"""
    agent_id: str = Field(..., description="Agent identifier")
    agent_name: str = Field(..., description="Human-readable agent name")
    agent_role: Optional[str] = Field(None, description="Agent's role")
    agent_goal: Optional[str] = Field(None, description="Agent's goal")
    backstory: Optional[str] = Field(None, description="Agent's backstory")
    llm_model: Optional[str] = Field(None, description="LLM model being used")
    status: Optional[str] = Field(None, description="Agent status")
    error_message: Optional[str] = Field(None, description="Error message if any")


class TaskEvent(BaseEvent):
    """Event for task execution"""
    task_id: str = Field(..., description="Task identifier")
    task_name: str = Field(..., description="Task name")
    task_description: Optional[str] = Field(None, description="Task description")
    agent_id: Optional[str] = Field(None, description="Agent executing the task")
    expected_output: Optional[str] = Field(None, description="Expected output description")
    actual_output: Optional[str] = Field(None, description="Actual task output")
    tools_used: List[str] = Field(default_factory=list, description="Tools used in task")
    status: Optional[str] = Field(None, description="Task status")
    error_message: Optional[str] = Field(None, description="Error message if any")


class ToolEvent(BaseEvent):
    """Event for tool usage"""
    tool_name: str = Field(..., description="Tool name")
    tool_input: Optional[Dict[str, Any]] = Field(None, description="Tool input parameters")
    tool_output: Optional[Any] = Field(None, description="Tool output")
    agent_id: Optional[str] = Field(None, description="Agent using the tool")
    task_id: Optional[str] = Field(None, description="Task context")
    execution_time_ms: Optional[int] = Field(None, description="Execution time in milliseconds")
    error_message: Optional[str] = Field(None, description="Error message if any")


class LLMEvent(BaseEvent):
    """Event for LLM interactions"""
    model_name: str = Field(..., description="LLM model name")
    provider: Optional[str] = Field(None, description="LLM provider (OpenAI, Anthropic, etc.)")
    prompt: Optional[str] = Field(None, description="Input prompt")
    response: Optional[str] = Field(None, description="LLM response")
    tokens_used: Optional[int] = Field(None, description="Total tokens used")
    prompt_tokens: Optional[int] = Field(None, description="Prompt tokens")
    completion_tokens: Optional[int] = Field(None, description="Completion tokens")
    cost_usd: Optional[float] = Field(None, description="Estimated cost in USD")
    latency_ms: Optional[int] = Field(None, description="Response latency in milliseconds")
    temperature: Optional[float] = Field(None, description="Model temperature")
    max_tokens: Optional[int] = Field(None, description="Max tokens setting")
    agent_id: Optional[str] = Field(None, description="Agent making the request")
    task_id: Optional[str] = Field(None, description="Task context")
    error_message: Optional[str] = Field(None, description="Error message if any")


class CrewRunSummary(BaseModel):
    """Summary of a complete crew execution"""
    crew_id: str = Field(..., description="Crew identifier")
    crew_name: Optional[str] = Field(None, description="Crew name")
    start_time: datetime = Field(..., description="Crew start time")
    end_time: Optional[datetime] = Field(None, description="Crew end time")
    duration_ms: Optional[int] = Field(None, description="Total duration in milliseconds")
    status: str = Field(..., description="Crew execution status")
    total_tokens: int = Field(default=0, description="Total tokens consumed")
    total_cost_usd: float = Field(default=0.0, description="Total cost in USD")
    agents_count: int = Field(default=0, description="Number of agents in crew")
    tasks_count: int = Field(default=0, description="Number of tasks executed")
    tools_used: List[str] = Field(default_factory=list, description="All tools used")
    error_message: Optional[str] = Field(None, description="Error message if crew failed")
    trace_context: TraceContext = Field(..., description="Trace context")


# Union type for all events
TelemetryEvent = Union[AgentEvent, TaskEvent, ToolEvent, LLMEvent]
