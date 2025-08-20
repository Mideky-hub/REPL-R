"""
Authentication endpoints
"""

from fastapi import APIRouter

router = APIRouter()

async def get_api_key() -> str:
    """Placeholder for API key validation"""
    return "dummy-key"
