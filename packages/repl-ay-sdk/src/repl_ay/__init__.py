"""
REPL;ay SDK - Observability and debugging for AI agents

This SDK provides automatic instrumentation and telemetry collection for AI agent systems,
with special support for CrewAI and other popular frameworks.
"""

__version__ = "0.1.0"
__author__ = "REPL;ay Team"
__email__ = "team@repl-ay.dev"

from .client import ReplAyClient
from .decorators import trace_agent, trace_task, trace_tool
from .integrations.crewai import CrewAIInstrumentation
from .types import (
    AgentEvent,
    TaskEvent,
    ToolEvent,
    LLMEvent,
    TraceContext,
    EventType,
)

__all__ = [
    "ReplAyClient",
    "trace_agent",
    "trace_task", 
    "trace_tool",
    "CrewAIInstrumentation",
    "AgentEvent",
    "TaskEvent",
    "ToolEvent",
    "LLMEvent",
    "TraceContext",
    "EventType",
]
