# REPL;ay Database Setup

This directory contains the database infrastructure for the REPL;ay platform.

## Architecture

- **ClickHouse**: High-performance columnar database for storing telemetry events and time-series data
- **PostgreSQL**: Relational database for user management, projects, and application configuration
- **Redis**: In-memory cache for sessions, rate limiting, and temporary data

## Quick Start

### Development Environment

```bash
# Start all services
docker-compose up -d

# Start only specific services  
docker-compose up -d clickhouse postgres redis

# View logs
docker-compose logs -f clickhouse

# Stop all services
docker-compose down
```

### Development Tools

Start the development profile to include management tools:

```bash
# Start with development tools
docker-compose --profile dev up -d

# Access tools:
# - ClickHouse: http://localhost:8123
# - pgAdmin: http://localhost:5050 (admin@repl-ay.dev / admin123)
# - Redis Commander: http://localhost:8081
```

## Database Schemas

### ClickHouse Schema

The `clickhouse_schema.sql` creates:

- **telemetry_events**: Main table for storing all observability events
- **telemetry_metrics_hourly**: Materialized view for aggregated metrics
- **trace_summaries**: Materialized view for trace-level aggregations

Key features:
- Partitioned by month for efficient queries
- 90-day TTL for automatic data cleanup
- Optimized for time-series analytics
- Built-in aggregations for dashboards

### PostgreSQL Schema

The `postgresql_schema.sql` creates:

- **users**: User accounts and authentication
- **organizations**: Multi-tenant organization structure
- **projects**: Project organization within teams
- **api_keys**: API authentication and authorization
- **environments**: Environment management (prod/staging/dev)
- **alerts**: Alert configuration and incident tracking
- **usage_records**: Billing and usage tracking

Key features:
- Row-level security (RLS) for multi-tenancy
- UUID primary keys for scalability
- Comprehensive indexing for performance
- Audit trails and soft deletes

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Database URLs
POSTGRES_URL=postgresql://repl_ay_user:repl_ay_password@localhost:5432/repl_ay
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=repl_ay
CLICKHOUSE_USERNAME=repl_ay_user
CLICKHOUSE_PASSWORD=repl_ay_password
REDIS_URL=redis://localhost:6379

# Application
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
```

### Production Deployment

For production, consider:

1. **Managed Services**: Use cloud-managed databases (AWS RDS, ClickHouse Cloud, etc.)
2. **Security**: Enable SSL/TLS, rotate credentials, restrict access
3. **Monitoring**: Set up monitoring and alerting
4. **Backups**: Implement automated backup strategies
5. **Scaling**: Configure read replicas and sharding as needed

Example production configuration:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: repl_ay
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      resources:
        reservations:
          memory: 2G
        limits:
          memory: 4G
          cpus: '2'
```

## Data Models

### Event Storage

Events are stored in a denormalized format optimized for analytics:

```sql
-- Example event query
SELECT 
    trace_id,
    count() as event_count,
    sum(tokens_used) as total_tokens,
    sum(cost_usd) as total_cost,
    max(timestamp) - min(timestamp) as duration_ms
FROM telemetry_events 
WHERE project_id = 'your-project-id'
  AND timestamp >= now() - INTERVAL 24 HOUR
GROUP BY trace_id
ORDER BY total_cost DESC
LIMIT 10;
```

### User Management

Multi-tenant structure with organizations and projects:

```sql
-- Get user's projects
SELECT p.name, p.slug, o.name as org_name
FROM projects p
JOIN organizations o ON p.organization_id = o.id  
JOIN organization_members om ON o.id = om.organization_id
WHERE om.user_id = 'user-id';
```

## Performance Optimization

### ClickHouse

- Partition by time (month) for efficient pruning
- Order by project_id, timestamp for query performance
- Use materialized views for pre-aggregated metrics
- Configure appropriate TTL for data retention

### PostgreSQL

- B-tree indexes on frequently queried columns
- Partial indexes for filtered queries
- Connection pooling (PgBouncer recommended)
- Regular VACUUM and ANALYZE

### Redis

- Configure appropriate eviction policies
- Monitor memory usage
- Use Redis Cluster for high availability

## Monitoring

Key metrics to monitor:

- **ClickHouse**: Query performance, disk usage, insert rate
- **PostgreSQL**: Connection count, query performance, replication lag  
- **Redis**: Memory usage, hit ratio, evicted keys

## Troubleshooting

### Common Issues

1. **ClickHouse connection errors**:
   ```bash
   docker-compose logs clickhouse
   # Check if service is healthy
   docker-compose ps
   ```

2. **PostgreSQL migration issues**:
   ```bash
   # Connect to database
   docker-compose exec postgres psql -U repl_ay_user -d repl_ay
   ```

3. **Redis memory issues**:
   ```bash
   # Check Redis info
   docker-compose exec redis redis-cli info memory
   ```

### Data Recovery

Both databases are configured with persistent volumes. To backup:

```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U repl_ay_user repl_ay > backup.sql

# ClickHouse backup (simplified)
docker-compose exec clickhouse clickhouse-client --query "BACKUP TABLE telemetry_events TO Disk('backups', 'backup.zip')"
```
