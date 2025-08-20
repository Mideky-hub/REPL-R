"""
Event models for the API
"""

from typing import Any, Dict, List
from pydantic import BaseModel


class TelemetryEvent(BaseModel):
    """Base telemetry event"""
    pass


class EventBatch(BaseModel):
    """Batch of telemetry events"""
    events: List[TelemetryEvent]
