"""
Decorators for easy instrumentation of AI agents, tasks, and tools
"""

import functools
import time
import traceback
import uuid
from datetime import datetime
from typing import Any, Callable, Optional, TypeVar, Union

from .client import get_client
from .types import (
    AgentEvent,
    TaskEvent,
    ToolEvent,
    LLMEvent,
    EventType,
    TraceContext,
)

F = TypeVar('F', bound=Callable[..., Any])


def trace_agent(
    name: Optional[str] = None,
    role: Optional[str] = None,
    goal: Optional[str] = None,
    backstory: Optional[str] = None,
    llm_model: Optional[str] = None,
) -> Callable[[F], F]:
    """
    Decorator to automatically trace agent execution
    
    Args:
        name: Agent name (defaults to function name)
        role: Agent's role
        goal: Agent's goal
        backstory: Agent's backstory
        llm_model: LLM model being used
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            client = get_client()
            if not client:
                return func(*args, **kwargs)
            
            agent_name = name or func.__name__
            agent_id = f"{agent_name}_{uuid.uuid4().hex[:8]}"
            trace_context = client.create_trace_context()
            
            # Start event
            start_event = AgentEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.AGENT_START,
                trace_context=trace_context,
                agent_id=agent_id,
                agent_name=agent_name,
                agent_role=role,
                agent_goal=goal,
                backstory=backstory,
                llm_model=llm_model,
                status="running",
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                
                # Success event
                end_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_END,
                    trace_context=trace_context,
                    agent_id=agent_id,
                    agent_name=agent_name,
                    agent_role=role,
                    agent_goal=goal,
                    backstory=backstory,
                    llm_model=llm_model,
                    status="completed",
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "result_type": type(result).__name__ if result else None,
                    }
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                # Error event
                error_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_ERROR,
                    trace_context=trace_context,
                    agent_id=agent_id,
                    agent_name=agent_name,
                    agent_role=role,
                    agent_goal=goal,
                    backstory=backstory,
                    llm_model=llm_model,
                    status="failed",
                    error_message=str(e),
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "error_type": type(e).__name__,
                        "traceback": traceback.format_exc(),
                    }
                )
                client.track_event(error_event)
                raise
        
        return wrapper
    return decorator


def trace_task(
    name: Optional[str] = None,
    description: Optional[str] = None,
    expected_output: Optional[str] = None,
    agent_id: Optional[str] = None,
) -> Callable[[F], F]:
    """
    Decorator to automatically trace task execution
    
    Args:
        name: Task name (defaults to function name)
        description: Task description
        expected_output: Expected output description
        agent_id: Agent executing the task
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            client = get_client()
            if not client:
                return func(*args, **kwargs)
            
            task_name = name or func.__name__
            task_id = f"{task_name}_{uuid.uuid4().hex[:8]}"
            trace_context = client.create_trace_context()
            
            # Start event
            start_event = TaskEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.TASK_START,
                trace_context=trace_context,
                task_id=task_id,
                task_name=task_name,
                task_description=description,
                agent_id=agent_id,
                expected_output=expected_output,
                status="running",
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                
                # Success event
                end_event = TaskEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TASK_END,
                    trace_context=trace_context,
                    task_id=task_id,
                    task_name=task_name,
                    task_description=description,
                    agent_id=agent_id,
                    expected_output=expected_output,
                    actual_output=str(result) if result else None,
                    status="completed",
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                    }
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                # Error event
                error_event = TaskEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TASK_ERROR,
                    trace_context=trace_context,
                    task_id=task_id,
                    task_name=task_name,
                    task_description=description,
                    agent_id=agent_id,
                    expected_output=expected_output,
                    status="failed",
                    error_message=str(e),
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "error_type": type(e).__name__,
                        "traceback": traceback.format_exc(),
                    }
                )
                client.track_event(error_event)
                raise
        
        return wrapper
    return decorator


def trace_tool(
    name: Optional[str] = None,
    agent_id: Optional[str] = None,
    task_id: Optional[str] = None,
) -> Callable[[F], F]:
    """
    Decorator to automatically trace tool usage
    
    Args:
        name: Tool name (defaults to function name)
        agent_id: Agent using the tool
        task_id: Task context
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            client = get_client()
            if not client:
                return func(*args, **kwargs)
            
            tool_name = name or func.__name__
            trace_context = client.create_trace_context()
            
            # Capture input parameters
            tool_input = {}
            if args:
                tool_input["args"] = args
            if kwargs:
                tool_input["kwargs"] = kwargs
            
            # Start event
            start_event = ToolEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.TOOL_START,
                trace_context=trace_context,
                tool_name=tool_name,
                tool_input=tool_input,
                agent_id=agent_id,
                task_id=task_id,
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = int((time.time() - start_time) * 1000)
                
                # Success event
                end_event = ToolEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TOOL_END,
                    trace_context=trace_context,
                    tool_name=tool_name,
                    tool_input=tool_input,
                    tool_output=result,
                    agent_id=agent_id,
                    task_id=task_id,
                    execution_time_ms=execution_time,
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                execution_time = int((time.time() - start_time) * 1000)
                
                # Error event
                error_event = ToolEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TOOL_ERROR,
                    trace_context=trace_context,
                    tool_name=tool_name,
                    tool_input=tool_input,
                    agent_id=agent_id,
                    task_id=task_id,
                    execution_time_ms=execution_time,
                    error_message=str(e),
                    metadata={
                        "error_type": type(e).__name__,
                        "traceback": traceback.format_exc(),
                    }
                )
                client.track_event(error_event)
                raise
        
        return wrapper
    return decorator


def trace_llm_call(
    model_name: str,
    provider: Optional[str] = None,
    agent_id: Optional[str] = None,
    task_id: Optional[str] = None,
) -> Callable[[F], F]:
    """
    Decorator to automatically trace LLM calls
    
    Args:
        model_name: LLM model name
        provider: LLM provider (OpenAI, Anthropic, etc.)
        agent_id: Agent making the request
        task_id: Task context
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            client = get_client()
            if not client:
                return func(*args, **kwargs)
            
            trace_context = client.create_trace_context()
            
            # Start event
            start_event = LLMEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.LLM_START,
                trace_context=trace_context,
                model_name=model_name,
                provider=provider,
                agent_id=agent_id,
                task_id=task_id,
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                latency_ms = int((time.time() - start_time) * 1000)
                
                # Try to extract tokens and cost from result
                tokens_used = None
                prompt_tokens = None
                completion_tokens = None
                cost_usd = None
                response_text = None
                
                if hasattr(result, 'usage'):
                    usage = result.usage
                    tokens_used = getattr(usage, 'total_tokens', None)
                    prompt_tokens = getattr(usage, 'prompt_tokens', None)
                    completion_tokens = getattr(usage, 'completion_tokens', None)
                
                if hasattr(result, 'choices') and result.choices:
                    choice = result.choices[0]
                    if hasattr(choice, 'message'):
                        response_text = choice.message.content
                
                # Success event
                end_event = LLMEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.LLM_END,
                    trace_context=trace_context,
                    model_name=model_name,
                    provider=provider,
                    response=response_text,
                    tokens_used=tokens_used,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    cost_usd=cost_usd,
                    latency_ms=latency_ms,
                    agent_id=agent_id,
                    task_id=task_id,
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                latency_ms = int((time.time() - start_time) * 1000)
                
                # Error event
                error_event = LLMEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.LLM_ERROR,
                    trace_context=trace_context,
                    model_name=model_name,
                    provider=provider,
                    latency_ms=latency_ms,
                    agent_id=agent_id,
                    task_id=task_id,
                    error_message=str(e),
                    metadata={
                        "error_type": type(e).__name__,
                        "traceback": traceback.format_exc(),
                    }
                )
                client.track_event(error_event)
                raise
        
        return wrapper
    return decorator
