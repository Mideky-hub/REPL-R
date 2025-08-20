"""
FastAPI main application
"""

from contextlib import asynccontextmanager
from typing import Any, Dict

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from .config import get_settings
from .middleware import LoggingMiddleware, MetricsMiddleware
from .routers import auth, events, traces, projects, health
from .database import init_db, close_db

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    settings = get_settings()
    
    # Startup
    logger.info("Starting REPL;ay API server", version=settings.version)
    await init_db()
    
    yield
    
    # Shutdown
    logger.info("Shutting down REPL;ay API server")
    await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    settings = get_settings()
    
    app = FastAPI(
        title="REPL;ay API",
        description="Observability and debugging platform for AI agentic systems",
        version=settings.version,
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url="/redoc" if settings.environment != "production" else None,
        lifespan=lifespan,
    )
    
    # Configure CORS
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Security middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts or ["*"],
    )
    
    # Custom middleware
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(MetricsMiddleware)
    
    # Include routers
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
    app.include_router(events.router, prefix="/v1/events", tags=["events"])
    app.include_router(traces.router, prefix="/v1/traces", tags=["traces"])
    app.include_router(projects.router, prefix="/v1/projects", tags=["projects"])
    
    # Prometheus metrics endpoint
    @app.get("/metrics")
    async def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    
    # OpenTelemetry instrumentation
    if settings.enable_tracing:
        FastAPIInstrumentor.instrument_app(app)
    
    return app


# Create the app instance
app = create_app()


@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint"""
    settings = get_settings()
    return {
        "service": "REPL;ay API",
        "version": settings.version,
        "status": "healthy",
        "docs": "/docs" if settings.environment != "production" else None,
    }
