# REPL;ay SDK

The Python SDK for REPL;ay - an observability and debugging platform for AI agentic systems.

## Features

- 🔍 **Automatic Instrumentation**: Zero-code instrumentation for CrewAI and other AI frameworks
- 📊 **Comprehensive Telemetry**: Track agents, tasks, tools, and LLM calls
- ⚡ **Low Overhead**: Lightweight SDK with minimal performance impact
- 🔌 **Easy Integration**: Simple decorators and context managers
- 📈 **Cost Tracking**: Monitor token usage and API costs in real-time
- 🔄 **OpenTelemetry Standard**: Built on industry-standard telemetry protocols

## Quick Start

### Installation

```bash
pip install repl-ay-sdk
```

### Basic Setup

```python
import repl_ay

# Initialize with your API key
repl_ay.initialize(
    api_key="your-api-key",
    project_id="your-project-id"
)

# Automatic CrewAI instrumentation
from repl_ay.integrations.crewai import auto_instrument
auto_instrument()

# Your existing CrewAI code now gets automatic observability!
from crewai import Crew, Agent, Task

crew = Crew(agents=[...], tasks=[...])
result = crew.kickoff()  # This is now fully traced!
```

### Manual Instrumentation

Use decorators for custom functions:

```python
from repl_ay import trace_agent, trace_task, trace_tool

@trace_agent(name="Research Agent", role="researcher")
def research_agent(query: str):
    return do_research(query)

@trace_task(name="Data Analysis", description="Analyze the research data")
def analyze_data(data):
    return perform_analysis(data)

@trace_tool(name="web_scraper")
def scrape_website(url: str):
    return scrape_data(url)
```

### Advanced Configuration

```python
import repl_ay

client = repl_ay.initialize(
    api_key="your-api-key",
    project_id="your-project-id",
    environment="production",
    base_url="https://api.repl-ay.dev",
    batch_size=50,  # Events per batch
    flush_interval_seconds=10,  # Auto-flush interval
    debug=True  # Enable debug logging
)

# Manual event tracking
from repl_ay.types import AgentEvent, EventType

event = AgentEvent(
    event_id="unique-id",
    event_type=EventType.AGENT_START,
    trace_context=client.create_trace_context(),
    agent_id="agent-1",
    agent_name="My Agent",
    agent_role="assistant",
    status="running"
)

client.track_event(event)

# Remember to flush on shutdown
client.close()
```

## Supported Frameworks

- ✅ **CrewAI**: Full automatic instrumentation
- 🔄 **AutoGen**: Coming soon
- 🔄 **LangChain**: Coming soon
- 🔄 **LlamaIndex**: Coming soon

## Event Types

The SDK tracks several types of events:

### Agent Events
- Agent start/end/error
- Role, goal, and backstory tracking
- LLM model information

### Task Events
- Task execution tracking
- Input/output capture
- Duration and status monitoring

### Tool Events
- Tool usage tracking
- Parameter and result logging
- Execution time measurement

### LLM Events
- Model calls and responses
- Token usage and cost calculation
- Latency monitoring

## Environment Variables

You can configure the SDK using environment variables:

```bash
export REPL_AY_API_KEY="your-api-key"
export REPL_AY_PROJECT_ID="your-project-id"
export REPL_AY_ENVIRONMENT="production"
export REPL_AY_BASE_URL="https://api.repl-ay.dev"
export REPL_AY_DEBUG="true"
```

Then initialize without parameters:

```python
import repl_ay
repl_ay.initialize()  # Will use environment variables
```

## Best Practices

1. **Initialize Early**: Set up the SDK at the start of your application
2. **Use Context**: Pass trace context between related operations
3. **Handle Errors**: The SDK is designed to fail gracefully
4. **Monitor Costs**: Set up alerts for unexpected token usage
5. **Test Locally**: Use debug mode during development

## Examples

### CrewAI Example

```python
import repl_ay
from repl_ay.integrations.crewai import auto_instrument
from crewai import Crew, Agent, Task, LLM

# Initialize REPL;ay
repl_ay.initialize(api_key="your-key", project_id="my-project")
auto_instrument()

# Define your crew (now automatically instrumented)
researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in AI and data science",
    backstory="You are an expert researcher with 10 years of experience",
    llm=LLM(model="gpt-4")
)

research_task = Task(
    description="Research the latest trends in AI agents",
    expected_output="A comprehensive report on AI agent trends",
    agent=researcher
)

crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    verbose=True
)

# This will be fully traced in REPL;ay!
result = crew.kickoff()
```

### Custom Tool Example

```python
from repl_ay import trace_tool
import requests

@trace_tool(name="api_fetcher")
def fetch_api_data(endpoint: str, params: dict = None):
    """Fetch data from an API endpoint"""
    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    return response.json()

# Usage (automatically traced)
data = fetch_api_data("https://api.example.com/data", {"limit": 10})
```

## Development

### Setting up Development Environment

```bash
git clone https://github.com/Mideky-hub/REPL-ay
cd REPL-ay/packages/repl-ay-sdk
pip install -e ".[dev]"
```

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black src/ tests/
ruff check src/ tests/
mypy src/
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.repl-ay.dev)
- 🐛 [Issues](https://github.com/Mideky-hub/REPL-ay/issues)
- 💬 [Discord Community](https://discord.gg/repl-ay)
- 📧 [Email Support](mailto:support@repl-ay.dev)
