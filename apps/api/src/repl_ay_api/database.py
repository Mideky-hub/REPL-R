"""
Database connection and utilities
"""
import os
import logging
from typing import Optional, Dict, Any, List

import asyncpg
from asyncpg import Pool

from .config import get_settings

logger = logging.getLogger(__name__)

# Global connection pool
_postgres_pool: Optional[Pool] = None


class MockClickHouseClient:
    """Mock ClickHouse client for development"""
    
    async def insert_batch(self, table: str, data):
        """Mock batch insert"""
        logger.info(f"Mock: Inserting {len(data)} rows into {table}")
    
    async def execute(self, query: str, params=None):
        """Mock query execution"""
        logger.info(f"Mock: Executing query: {query}")
        return []


async def get_clickhouse_client():
    """Get ClickHouse client"""
    return MockClickHouseClient()


async def get_postgres_pool():
    """Get PostgreSQL connection pool"""
    global _postgres_pool
    
    if _postgres_pool is None:
        # Get database URL from environment configuration
        settings = get_settings()
        database_url = settings.postgres_url
        
        try:
            _postgres_pool = await asyncpg.create_pool(
                database_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            logger.info("PostgreSQL connection pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create PostgreSQL pool: {e}")
            raise e
    
    return _postgres_pool


async def init_db():
    """Initialize database connections"""
    global _postgres_pool
    await get_postgres_pool()
    logger.info("Database connections initialized")


async def close_db():
    """Close database connections"""
    global _postgres_pool
    
    if _postgres_pool:
        await _postgres_pool.close()
        _postgres_pool = None
        logger.info("Database connections closed")


async def check_database_health() -> bool:
    """Check if database is healthy"""
    try:
        pool = await get_postgres_pool()
        async with pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
