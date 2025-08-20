"""
CrewAI integration for automatic instrumentation
"""

import time
import uuid
from datetime import datetime
from typing import Any, Dict, Optional, Type, Union

from ..client import get_client
from ..types import (
    AgentEvent,
    TaskEvent,
    ToolEvent,
    LLMEvent,
    CrewRunSummary,
    EventType,
    TraceContext,
)


class CrewAIInstrumentation:
    """
    Automatic instrumentation for CrewAI frameworks
    """
    
    def __init__(self, enabled: bool = True):
        self.enabled = enabled
        self._active_traces: Dict[str, TraceContext] = {}
        self._crew_start_times: Dict[str, float] = {}
        
    def instrument(self) -> None:
        """
        Apply instrumentation to CrewAI classes
        """
        if not self.enabled:
            return
            
        try:
            # Try to import and instrument CrewAI
            import crewai
            self._instrument_crew(crewai.Crew)
            self._instrument_agent(crewai.Agent)
            self._instrument_task(crewai.Task)
            
        except ImportError:
            print("[REPL;ay] CrewAI not found. Skipping instrumentation.")
            return
        except Exception as e:
            print(f"[REPL;ay] Failed to instrument CrewAI: {e}")
            return
    
    def _instrument_crew(self, crew_class: Type) -> None:
        """Instrument CrewAI Crew class"""
        original_kickoff = crew_class.kickoff
        
        def instrumented_kickoff(crew_self, *args, **kwargs):
            client = get_client()
            if not client or not self.enabled:
                return original_kickoff(crew_self, *args, **kwargs)
            
            crew_id = f"crew_{uuid.uuid4().hex[:8]}"
            trace_context = client.create_trace_context()
            self._active_traces[crew_id] = trace_context
            self._crew_start_times[crew_id] = time.time()
            
            # Create crew start event
            start_event = AgentEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.AGENT_START,
                trace_context=trace_context,
                agent_id=crew_id,
                agent_name="CrewAI Crew",
                agent_role="coordinator",
                status="running",
                metadata={
                    "crew_id": crew_id,
                    "agents_count": len(crew_self.agents) if hasattr(crew_self, 'agents') else 0,
                    "tasks_count": len(crew_self.tasks) if hasattr(crew_self, 'tasks') else 0,
                }
            )
            client.track_event(start_event)
            
            try:
                result = original_kickoff(crew_self, *args, **kwargs)
                
                # Create crew success event
                duration_ms = int((time.time() - self._crew_start_times[crew_id]) * 1000)
                end_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_END,
                    trace_context=trace_context,
                    agent_id=crew_id,
                    agent_name="CrewAI Crew",
                    agent_role="coordinator",
                    status="completed",
                    metadata={
                        "crew_id": crew_id,
                        "duration_ms": duration_ms,
                        "result_type": type(result).__name__ if result else None,
                    }
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                # Create crew error event
                duration_ms = int((time.time() - self._crew_start_times[crew_id]) * 1000)
                error_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_ERROR,
                    trace_context=trace_context,
                    agent_id=crew_id,
                    agent_name="CrewAI Crew",
                    agent_role="coordinator",
                    status="failed",
                    error_message=str(e),
                    metadata={
                        "crew_id": crew_id,
                        "duration_ms": duration_ms,
                        "error_type": type(e).__name__,
                    }
                )
                client.track_event(error_event)
                raise
            finally:
                # Cleanup
                self._active_traces.pop(crew_id, None)
                self._crew_start_times.pop(crew_id, None)
        
        crew_class.kickoff = instrumented_kickoff
    
    def _instrument_agent(self, agent_class: Type) -> None:
        """Instrument CrewAI Agent class"""
        original_execute_task = getattr(agent_class, 'execute_task', None)
        if not original_execute_task:
            return
            
        def instrumented_execute_task(agent_self, task, *args, **kwargs):
            client = get_client()
            if not client or not self.enabled:
                return original_execute_task(agent_self, task, *args, **kwargs)
            
            agent_id = f"agent_{getattr(agent_self, 'role', 'unknown')}_{uuid.uuid4().hex[:8]}"
            trace_context = client.create_trace_context()
            
            # Create agent start event
            start_event = AgentEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.AGENT_START,
                trace_context=trace_context,
                agent_id=agent_id,
                agent_name=getattr(agent_self, 'role', 'Unknown Agent'),
                agent_role=getattr(agent_self, 'role', None),
                agent_goal=getattr(agent_self, 'goal', None),
                backstory=getattr(agent_self, 'backstory', None),
                llm_model=getattr(getattr(agent_self, 'llm', None), 'model_name', None),
                status="running",
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = original_execute_task(agent_self, task, *args, **kwargs)
                
                # Create agent success event
                end_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_END,
                    trace_context=trace_context,
                    agent_id=agent_id,
                    agent_name=getattr(agent_self, 'role', 'Unknown Agent'),
                    agent_role=getattr(agent_self, 'role', None),
                    agent_goal=getattr(agent_self, 'goal', None),
                    backstory=getattr(agent_self, 'backstory', None),
                    llm_model=getattr(getattr(agent_self, 'llm', None), 'model_name', None),
                    status="completed",
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "task_description": getattr(task, 'description', None),
                    }
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                # Create agent error event
                error_event = AgentEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.AGENT_ERROR,
                    trace_context=trace_context,
                    agent_id=agent_id,
                    agent_name=getattr(agent_self, 'role', 'Unknown Agent'),
                    agent_role=getattr(agent_self, 'role', None),
                    agent_goal=getattr(agent_self, 'goal', None),
                    backstory=getattr(agent_self, 'backstory', None),
                    llm_model=getattr(getattr(agent_self, 'llm', None), 'model_name', None),
                    status="failed",
                    error_message=str(e),
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "error_type": type(e).__name__,
                    }
                )
                client.track_event(error_event)
                raise
        
        agent_class.execute_task = instrumented_execute_task
    
    def _instrument_task(self, task_class: Type) -> None:
        """Instrument CrewAI Task class"""
        original_execute = getattr(task_class, 'execute', None)
        if not original_execute:
            return
            
        def instrumented_execute(task_self, *args, **kwargs):
            client = get_client()
            if not client or not self.enabled:
                return original_execute(task_self, *args, **kwargs)
            
            task_id = f"task_{uuid.uuid4().hex[:8]}"
            trace_context = client.create_trace_context()
            
            # Create task start event
            start_event = TaskEvent(
                event_id=str(uuid.uuid4()),
                event_type=EventType.TASK_START,
                trace_context=trace_context,
                task_id=task_id,
                task_name=getattr(task_self, 'name', 'Unnamed Task'),
                task_description=getattr(task_self, 'description', None),
                expected_output=getattr(task_self, 'expected_output', None),
                status="running",
            )
            client.track_event(start_event)
            
            start_time = time.time()
            try:
                result = original_execute(task_self, *args, **kwargs)
                
                # Create task success event
                end_event = TaskEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TASK_END,
                    trace_context=trace_context,
                    task_id=task_id,
                    task_name=getattr(task_self, 'name', 'Unnamed Task'),
                    task_description=getattr(task_self, 'description', None),
                    expected_output=getattr(task_self, 'expected_output', None),
                    actual_output=str(result) if result else None,
                    status="completed",
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                    }
                )
                client.track_event(end_event)
                
                return result
                
            except Exception as e:
                # Create task error event
                error_event = TaskEvent(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.TASK_ERROR,
                    trace_context=trace_context,
                    task_id=task_id,
                    task_name=getattr(task_self, 'name', 'Unnamed Task'),
                    task_description=getattr(task_self, 'description', None),
                    expected_output=getattr(task_self, 'expected_output', None),
                    status="failed",
                    error_message=str(e),
                    metadata={
                        "duration_ms": int((time.time() - start_time) * 1000),
                        "error_type": type(e).__name__,
                    }
                )
                client.track_event(error_event)
                raise
        
        task_class.execute = instrumented_execute


# Global instrumentation instance
_instrumentation: Optional[CrewAIInstrumentation] = None


def auto_instrument(enabled: bool = True) -> CrewAIInstrumentation:
    """
    Automatically instrument CrewAI classes
    
    Args:
        enabled: Whether to enable instrumentation
    
    Returns:
        The instrumentation instance
    """
    global _instrumentation
    _instrumentation = CrewAIInstrumentation(enabled=enabled)
    _instrumentation.instrument()
    return _instrumentation


def get_instrumentation() -> Optional[CrewAIInstrumentation]:
    """Get the current instrumentation instance"""
    return _instrumentation
