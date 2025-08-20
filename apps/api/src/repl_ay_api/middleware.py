"""
Middleware for logging, metrics, etc.
"""

import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log HTTP requests"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Log request
        duration = time.time() - start_time
        print(f"{request.method} {request.url} - {response.status_code} - {duration:.3f}s")
        
        return response


class MetricsMiddleware(BaseHTTPMiddleware):
    """Collect metrics"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        # Collect metrics (placeholder)
        duration = time.time() - start_time
        # In real implementation, send to Prometheus/metrics system
        
        return response
