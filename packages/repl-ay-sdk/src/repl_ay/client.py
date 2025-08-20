"""
Main REPL;ay client for telemetry collection and transmission
"""

import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from urllib.parse import urljoin

import httpx
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource

from .types import TelemetryEvent, TraceContext, CrewRunSummary


class ReplAyClient:
    """
    Main client for sending telemetry data to REPL;ay platform
    """

    def __init__(
        self,
        api_key: str,
        project_id: Optional[str] = None,
        base_url: str = "https://api.repl-ay.dev",
        environment: str = "production",
        batch_size: int = 100,
        flush_interval_seconds: int = 30,
        debug: bool = False,
    ):
        """
        Initialize REPL;ay client
        
        Args:
            api_key: Your REPL;ay API key
            project_id: Optional project identifier
            base_url: REPL;ay API base URL
            environment: Environment name (production, staging, development)
            batch_size: Number of events to batch before sending
            flush_interval_seconds: How often to flush batched events
            debug: Enable debug logging
        """
        self.api_key = api_key
        self.project_id = project_id
        self.base_url = base_url.rstrip('/')
        self.environment = environment
        self.batch_size = batch_size
        self.flush_interval_seconds = flush_interval_seconds
        self.debug = debug
        
        self._session_id = str(uuid.uuid4())
        self._event_buffer: List[TelemetryEvent] = []
        self._last_flush = time.time()
        
        # Initialize HTTP client
        self._http_client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "repl-ay-sdk/0.1.0",
            },
            timeout=30.0,
        )
        
        # Initialize OpenTelemetry
        self._setup_opentelemetry()
        
    def _setup_opentelemetry(self) -> None:
        """Setup OpenTelemetry tracing"""
        resource = Resource.create({
            "service.name": "repl-ay-instrumented-app",
            "service.version": "0.1.0",
            "deployment.environment": self.environment,
            "repl_ay.project_id": self.project_id or "default",
            "repl_ay.session_id": self._session_id,
        })
        
        provider = TracerProvider(resource=resource)
        
        # Setup OTLP exporter for traces
        otlp_exporter = OTLPSpanExporter(
            endpoint=f"{self.base_url}/v1/traces",
            headers={"Authorization": f"Bearer {self.api_key}"},
        )
        
        processor = BatchSpanProcessor(otlp_exporter)
        provider.add_span_processor(processor)
        
        trace.set_tracer_provider(provider)
        self._tracer = trace.get_tracer(__name__)
    
    def create_trace_context(
        self, 
        trace_id: Optional[str] = None,
        parent_span_id: Optional[str] = None,
    ) -> TraceContext:
        """Create a new trace context"""
        return TraceContext(
            trace_id=trace_id or str(uuid.uuid4()),
            span_id=str(uuid.uuid4()),
            parent_span_id=parent_span_id,
            session_id=self._session_id,
        )
    
    def track_event(self, event: TelemetryEvent) -> None:
        """
        Track a telemetry event
        
        Args:
            event: The event to track
        """
        self._event_buffer.append(event)
        
        if self.debug:
            print(f"[REPL;ay] Tracked event: {event.event_type}")
        
        # Auto-flush if buffer is full or enough time has passed
        if (len(self._event_buffer) >= self.batch_size or 
            time.time() - self._last_flush >= self.flush_interval_seconds):
            self._flush_events()
    
    def _flush_events(self) -> None:
        """Flush buffered events to the API"""
        if not self._event_buffer:
            return
            
        events_to_send = self._event_buffer[:]
        self._event_buffer.clear()
        self._last_flush = time.time()
        
        # Send events asynchronously (fire and forget)
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(self._send_events_async(events_to_send))
        except RuntimeError:
            # No event loop running, create a new one
            asyncio.create_task(self._send_events_async(events_to_send))
    
    async def _send_events_async(self, events: List[TelemetryEvent]) -> None:
        """Send events to API asynchronously"""
        try:
            payload = {
                "events": [event.dict() for event in events],
                "session_id": self._session_id,
                "project_id": self.project_id,
                "environment": self.environment,
                "timestamp": datetime.utcnow().isoformat(),
            }
            
            response = await self._http_client.post(
                f"{self.base_url}/v1/events",
                json=payload,
            )
            
            if response.status_code != 200:
                if self.debug:
                    print(f"[REPL;ay] Failed to send events: {response.status_code} {response.text}")
            elif self.debug:
                print(f"[REPL;ay] Successfully sent {len(events)} events")
                
        except Exception as e:
            if self.debug:
                print(f"[REPL;ay] Error sending events: {e}")
    
    def flush(self) -> None:
        """Manually flush all buffered events"""
        self._flush_events()
    
    def close(self) -> None:
        """Close the client and flush remaining events"""
        self.flush()
        # Give a moment for async send to complete
        import asyncio
        import time
        time.sleep(0.1)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Global client instance
_global_client: Optional[ReplAyClient] = None


def initialize(
    api_key: str,
    project_id: Optional[str] = None,
    **kwargs
) -> ReplAyClient:
    """
    Initialize the global REPL;ay client
    
    Args:
        api_key: Your REPL;ay API key
        project_id: Optional project identifier
        **kwargs: Additional client configuration
    
    Returns:
        The initialized client
    """
    global _global_client
    _global_client = ReplAyClient(api_key=api_key, project_id=project_id, **kwargs)
    return _global_client


def get_client() -> Optional[ReplAyClient]:
    """Get the global client instance"""
    return _global_client


def track_event(event: TelemetryEvent) -> None:
    """Track an event using the global client"""
    client = get_client()
    if client:
        client.track_event(event)
    elif event.trace_context.session_id:  # Debug mode fallback
        print(f"[REPL;ay] No client initialized. Event: {event.event_type}")
