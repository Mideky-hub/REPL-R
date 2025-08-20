# REPL;ay

**An Observability & Debugging Platform for AI Agentic Systems**

REPL;ay bridges the critical gap between AI agent prototyping and production deployment by providing comprehensive observability, debugging, and cost management tools for multi-agent systems.

![REPL;ay Dashboard](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

## 🔥 The Problem We Solve

**"Debugging AI agents in production is hell"** - Every AI developer, 2024

Developers consistently report that while frameworks like CrewAI and AutoGen are excellent for prototyping, they become opaque "black boxes" in production. This lack of visibility creates barriers to shipping with confidence:

- ❌ **No Observability**: Can't see agent decision-making loops, final prompts, or tool calls
- ❌ **Impossible Debugging**: When agents fail, finding the root cause takes hours of manual log-digging  
- ❌ **Unpredictable Costs**: Runaway processes can lead to surprise bills of hundreds of dollars
- ❌ **Inconsistent Performance**: Non-deterministic behavior makes reliable production deployment difficult

## ✅ The REPL;ay Solution

**Production-grade observability for AI agents, with zero code changes required.**

### 🔍 **Visual Agent Tracing**
- See every step your agents take in an interactive timeline
- Trace inter-agent communications and task handoffs
- View final prompts sent to LLMs and their responses
- Inspect tool inputs/outputs with precise timing

### ⏰ **Time-Travel Debugging** 
- "Rewind" and replay any agent run with point-in-time precision
- Inspect the exact system state when failures occurred
- Compare successful vs. failed runs side-by-side
- Dramatically reduce debugging time from hours to minutes

### 💰 **Cost & Performance Monitoring**
- Track token consumption and costs per agent, task, and model
- Set budget alerts to prevent surprise bills
- Monitor latency and performance across your agent fleet
- Optimize costs with granular usage analytics

## 🚀 Quick Start

### 1. Install the SDK

```bash
pip install repl-ay-sdk
```

### 2. Add Two Lines to Your Code

```python
import repl_ay
from repl_ay.integrations.crewai import auto_instrument

# Initialize with your API key
repl_ay.initialize(api_key="your-api-key")

# Auto-instrument CrewAI (zero code changes!)
auto_instrument()

# Your existing code now gets full observability!
crew = Crew(agents=[...], tasks=[...])
result = crew.kickoff()  # This is now fully traced in REPL;ay! 🎉
```

### 3. View Your Data

Visit your REPL;ay dashboard to see:
- Real-time agent execution traces
- Cost breakdowns by model and agent
- Performance metrics and error tracking
- Historical trends and usage patterns

## 🏗️ Architecture

REPL;ay is built for scale using modern, serverless technologies:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **SDK** | Python + OpenTelemetry | Lightweight instrumentation |
| **API** | FastAPI + Serverless | Scalable data ingestion |
| **Analytics DB** | ClickHouse | High-performance time-series queries |
| **App DB** | PostgreSQL | User management and configuration |
| **Frontend** | React + TypeScript | Interactive dashboard and debugging UI |
| **Cache** | Redis | Session management and rate limiting |

## 📊 What You'll See

### Agent Trace Timeline
```
10:30:15 🤖 Research Agent START
10:30:16 🔧 web_scraper(url="https://...") → 2.3s, 1,240 tokens, $0.12
10:30:18 🧠 gpt-4("Analyze this data...") → 1.8s, 850 tokens, $0.08
10:30:20 ✅ Research Agent END → Total: $0.20, 4.2s

10:30:20 🤖 Writer Agent START  
10:30:21 🧠 gpt-4("Write article about...") → 3.1s, 1,450 tokens, $0.15
10:30:24 🔧 file_writer(content="...") → 0.2s
10:30:24 ✅ Writer Agent END → Total: $0.15, 3.3s

TRACE SUMMARY: $0.35, 7.5s, 2 agents, 3 tools, 3,540 tokens
```

### Cost Dashboard
- **Today**: $47.82 (↑12% vs yesterday)
- **GPT-4**: $28.50 (60%), **GPT-3.5**: $12.30 (26%), **Claude**: $7.02 (14%)
- **Top Agent**: Research Agent ($18.45, 38%)
- **Budget Alert**: 85% of monthly budget used

## 🎯 Supported Frameworks

| Framework | Status | Auto-Instrumentation | Manual Decorators |
|-----------|--------|---------------------|-------------------|
| **CrewAI** | ✅ Ready | ✅ Full Support | ✅ Available |
| **AutoGen** | 🔄 Coming Soon | 🔄 In Development | ✅ Available |  
| **LangChain** | 🔄 Coming Soon | 🔄 In Development | ✅ Available |
| **LlamaIndex** | 🔄 Coming Soon | 🔄 In Development | ✅ Available |
| **Custom Agents** | ✅ Ready | ❌ N/A | ✅ Full Support |

## 📁 Project Structure

```
REPL-ay/
├── packages/
│   └── repl-ay-sdk/          # Python SDK for instrumentation
├── apps/
│   ├── dashboard/            # React dashboard frontend  
│   └── api/                  # FastAPI backend server
├── database/                 # Database schemas and migrations
├── examples/                 # Example implementations
└── docs/                     # Documentation
```

## 🛠️ Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose

### Quick Development Setup

```bash
# Clone the repository
git clone https://github.com/Mideky-hub/REPL-ay
cd REPL-ay

# Start databases
cd database && docker-compose up -d

# Install and run the API
cd apps/api && pip install -e . && python run.py

# Install and run the dashboard  
cd apps/dashboard && pnpm install && pnpm dev

# Install and test the SDK
cd packages/repl-ay-sdk && pip install -e ".[dev]"
```

### Run Example

```bash
cd examples
python manual_instrumentation.py
```

The example will generate telemetry data you can view in your dashboard at `http://localhost:3000`.

## 🚀 Deployment

### Production Architecture

For production, REPL;ay is designed to run on serverless infrastructure:

- **Frontend**: Vercel/Netlify
- **API**: AWS Lambda + API Gateway  
- **Databases**: ClickHouse Cloud + Supabase
- **Monitoring**: Built-in Prometheus metrics

### Estimated Monthly Costs

| Service | Cost (EUR) | Notes |
|---------|------------|-------|
| Frontend Hosting | €0-20 | Vercel Pro |
| Serverless API | €0-25 | AWS Lambda free tier |
| ClickHouse Cloud | €50-150 | Scales with data volume |
| PostgreSQL | €0-25 | Supabase free tier |
| **Total** | **€85-270** | Sustainable for early-stage SaaS |

## 🤝 Contributing

We're building REPL;ay in public! Contributions are welcome:

1. 🐛 **Report bugs** via [GitHub Issues](https://github.com/Mideky-hub/REPL-ay/issues)
2. 💡 **Request features** via [GitHub Discussions](https://github.com/Mideky-hub/REPL-ay/discussions)
3. 🔧 **Submit PRs** for bug fixes and improvements
4. 📚 **Improve docs** and add examples

### Development Principles

- **Ship fast, iterate based on feedback**
- **Developer experience first**  
- **Production-ready from day one**
- **Open source at core, SaaS for convenience**

## 📈 Roadmap

### Phase 1: Core Observability ✅
- [x] Python SDK with OpenTelemetry
- [x] FastAPI ingestion server
- [x] React dashboard with trace visualization
- [x] CrewAI auto-instrumentation
- [x] Cost tracking and alerts

### Phase 2: Advanced Features (Q2 2024)
- [ ] No-code agent workflow builder
- [ ] Real-time collaboration and sharing
- [ ] Advanced analytics and insights
- [ ] AutoGen and LangChain integrations
- [ ] Mobile app for monitoring

### Phase 3: Enterprise Features (Q3 2024)  
- [ ] SSO and advanced auth
- [ ] Custom integrations and webhooks
- [ ] Advanced alerting and incidents
- [ ] Multi-region deployments
- [ ] Enterprise support

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Community

- 📚 **Documentation**: [docs.repl-ay.dev](https://docs.repl-ay.dev)
- 💬 **Discord**: [Join our community](https://discord.gg/repl-ay)  
- 🐛 **Issues**: [GitHub Issues](https://github.com/Mideky-hub/REPL-ay/issues)
- 📧 **Email**: [team@repl-ay.dev](mailto:team@repl-ay.dev)

---

**Made with ❤️ by developers frustrated with debugging AI agents in production.**

*"Finally, I can see what my agents are actually doing!" - Early Beta User*
