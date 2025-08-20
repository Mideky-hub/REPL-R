"""
Health check endpoints
"""

import time
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "REPL;ay API",
        "version": "0.1.0",
    }


@router.get("/live")
async def liveness() -> Dict[str, str]:
    """Kubernetes liveness probe"""
    return {"status": "alive"}


@router.get("/ready")
async def readiness() -> Dict[str, str]:
    """Kubernetes readiness probe"""
    # In a real implementation, you'd check:
    # - Database connectivity
    # - Redis connectivity
    # - Any critical dependencies
    return {"status": "ready"}
