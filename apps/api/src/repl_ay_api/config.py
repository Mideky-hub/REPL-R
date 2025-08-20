"""
Configuration settings for the API server
"""

import os
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App info
    app_name: str = "REPL;ay API"
    version: str = "0.1.0"
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Security
    secret_key: str = Field(..., env="SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # Database
    postgres_url: str = Field(..., env="POSTGRES_URL")
    clickhouse_host: str = Field(default="localhost", env="CLICKHOUSE_HOST")
    clickhouse_port: int = Field(default=8123, env="CLICKHOUSE_PORT") 
    clickhouse_database: str = Field(default="repl_ay", env="CLICKHOUSE_DATABASE")
    clickhouse_username: str = Field(default="default", env="CLICKHOUSE_USERNAME")
    clickhouse_password: str = Field(default="", env="CLICKHOUSE_PASSWORD")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # CORS
    cors_origins: Optional[List[str]] = Field(default=None, env="CORS_ORIGINS")
    allowed_hosts: Optional[List[str]] = Field(default=None, env="ALLOWED_HOSTS")
    
    @field_validator('cors_origins', 'allowed_hosts', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(',') if i.strip()]
        return v
    
    # Features
    enable_tracing: bool = Field(default=True, env="ENABLE_TRACING")
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    
    # Rate limiting
    rate_limit_requests: int = Field(default=1000, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # seconds
    
    # Batch processing
    batch_size: int = Field(default=1000, env="BATCH_SIZE")
    batch_timeout: int = Field(default=10, env="BATCH_TIMEOUT")  # seconds
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")  # json or console
    
    # AI/LLM Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    default_llm_model: str = Field(default="gpt-4o-mini", env="DEFAULT_LLM_MODEL")
    max_tokens: int = Field(default=4000, env="MAX_TOKENS")
    temperature: float = Field(default=0.1, env="TEMPERATURE")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Singleton settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
