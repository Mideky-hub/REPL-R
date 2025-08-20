"""
Real CrewAI execution service with detailed telemetry tracking
"""

import asyncio
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

import tiktoken
from crewai import Agent, Crew, Task
from langchain_openai import ChatOpenAI
import structlog

from ..config import get_settings

logger = structlog.get_logger()


class TokenCounter:
    """Utility to count tokens for cost calculation"""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model
        try:
            self.encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback to cl100k_base encoding for unknown models
            self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in a text string"""
        return len(self.encoding.encode(text))


class CrewExecutor:
    """Real CrewAI executor with detailed tracking"""
    
    def __init__(self):
        self.settings = get_settings()
        self.token_counter = TokenCounter(self.settings.default_llm_model)
        
        # Token costs per 1K tokens (as of 2024)
        self.token_costs = {
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
            # Deep Infra models (typical pricing)
            "Qwen/Qwen3-235B-A22B-Instruct-2507": {"input": 0.0001, "output": 0.0005},
            "Qwen/Qwen2.5-72B-Instruct": {"input": 0.00008, "output": 0.0004},
            "Meta-Llama/Meta-Llama-3.1-405B-Instruct": {"input": 0.0002, "output": 0.001},
            "Meta-Llama/Meta-Llama-3.1-70B-Instruct": {"input": 0.00006, "output": 0.0003},
            "mistralai/Mixtral-8x7B-Instruct-v0.1": {"input": 0.00007, "output": 0.00035},
            "microsoft/DialoGPT-medium": {"input": 0.00005, "output": 0.00025},
            # Fallback Qwen models
            "qwen-plus": {"input": 0.0001, "output": 0.0005},
            "qwen-turbo": {"input": 0.00005, "output": 0.0002},
        }
    
    def _create_llm(self, model: Optional[str] = None, temperature: Optional[float] = None) -> ChatOpenAI:
        """Create an LLM instance with proper error handling"""
        api_key = self.settings.openai_api_key
        if not api_key or api_key == "your-openai-api-key-here":
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.")
        
        selected_model = model or self.settings.default_llm_model
        
        # Handle different model providers
        if selected_model.startswith(("Qwen/", "Meta-Llama/", "mistralai/", "microsoft/")):
            # Deep Infra models - use their OpenAI-compatible endpoint
            logger.info(f"Using Deep Infra for model: {selected_model}")
            return ChatOpenAI(
                api_key=api_key,
                model=selected_model,
                temperature=temperature or self.settings.temperature,
                max_tokens=self.settings.max_tokens,
                base_url="https://api.deepinfra.com/v1/openai"
            )
        else:
            # Standard OpenAI models
            return ChatOpenAI(
                api_key=api_key,
                model=selected_model,
                temperature=temperature or self.settings.temperature,
                max_tokens=self.settings.max_tokens,
            )
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Calculate cost based on token usage"""
        costs = self.token_costs.get(model, self.token_costs["gpt-4o-mini"])
        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]
        return input_cost + output_cost
    
    async def execute_crew(
        self,
        crew_id: str,
        execution_id: str,
        session_id: str,
        project_id: str,
        crew_config: Dict[str, Any],
        input_data: Dict[str, Any],
        model_config: Dict[str, Any],
        telemetry_callback=None
    ) -> Dict[str, Any]:
        """Execute a crew with real CrewAI and track everything"""
        
        logger.info(
            "Starting real CrewAI execution",
            execution_id=execution_id,
            crew_id=crew_id,
            project_id=project_id
        )
        
        start_time = time.time()
        total_input_tokens = 0
        total_output_tokens = 0
        total_cost = 0.0
        
        try:
            # Extract task from input data
            task_description = input_data.get("task", "Complete the assigned work")
            
            if not task_description.strip():
                raise ValueError("Task description cannot be empty")
            
            # Get model configuration
            llm_model = model_config.get("model", self.settings.default_llm_model)
            temperature = model_config.get("temperature", self.settings.temperature)
            
            # Create LLM instance with error handling
            try:
                llm = self._create_llm(llm_model, temperature)
                logger.info(f"Created LLM instance with model: {llm_model}")
            except Exception as llm_error:
                logger.error(f"Failed to create LLM: {llm_error}")
                raise ValueError(f"Failed to initialize AI model: {str(llm_error)}")
            
            # Create agents from crew configuration
            agents = []
            agent_configs = crew_config.get("agents", [])
            
            if not agent_configs:
                # Default agents if none configured
                agent_configs = [
                    {
                        "id": "researcher",
                        "name": "Research Specialist",
                        "role": "Senior Research Analyst",
                        "goal": "Conduct thorough research and analysis on given topics",
                        "backstory": "You are an experienced research analyst with a keen eye for detail and ability to synthesize complex information."
                    },
                    {
                        "id": "analyst",
                        "name": "Data Analyst", 
                        "role": "Data Analysis Expert",
                        "goal": "Analyze data and provide insights and recommendations",
                        "backstory": "You are a skilled data analyst who excels at finding patterns and drawing meaningful conclusions from information."
                    },
                    {
                        "id": "writer",
                        "name": "Content Writer",
                        "role": "Technical Writer",
                        "goal": "Create clear, comprehensive, and well-structured content",
                        "backstory": "You are a professional technical writer who can transform complex information into clear, actionable content."
                    }
                ]
            
            # Log crew start event
            if telemetry_callback:
                await telemetry_callback({
                    "event_id": str(uuid4()),
                    "event_type": "crew.start",
                    "timestamp": datetime.utcnow().isoformat(),
                    "trace_context": {
                        "trace_id": execution_id,
                        "span_id": str(uuid4()),
                        "parent_span_id": None
                    },
                    "session_id": session_id,
                    "project_id": project_id,
                    "environment": "production",
                    "crew_id": crew_id,
                    "execution_id": execution_id,
                    "agents_count": len(agent_configs),
                    "task_description": task_description,
                    "model_config": model_config,
                    "llm_model": llm_model
                })
            
            # Create CrewAI agents
            for agent_config in agent_configs:
                agent_start_time = time.time()
                agent_span_id = str(uuid4())
                
                # Create agent
                agent = Agent(
                    role=agent_config.get("role", "Agent"),
                    goal=agent_config.get("goal", "Complete assigned tasks efficiently"),
                    backstory=agent_config.get("backstory", "You are a helpful AI assistant."),
                    verbose=True,
                    llm=llm,
                    allow_delegation=False
                )
                agents.append({
                    "agent": agent,
                    "config": agent_config,
                    "span_id": agent_span_id,
                    "start_time": agent_start_time
                })
                
                # Log agent start
                if telemetry_callback:
                    await telemetry_callback({
                        "event_id": str(uuid4()),
                        "event_type": "agent.start",
                        "timestamp": datetime.utcnow().isoformat(),
                        "trace_context": {
                            "trace_id": execution_id,
                            "span_id": agent_span_id,
                            "parent_span_id": execution_id
                        },
                        "session_id": session_id,
                        "project_id": project_id,
                        "environment": "production",
                        "agent_id": agent_config.get("id", f"agent-{len(agents)}"),
                        "agent_name": agent_config.get("name", "Unknown Agent"),
                        "agent_role": agent_config.get("role", "Agent")
                    })
            
            # Create CrewAI task
            task = Task(
                description=task_description,
                expected_output="A comprehensive analysis and response to the given task",
                agent=agents[0]["agent"] if agents else None
            )
            
            # Create and execute crew
            crew = Crew(
                agents=[agent_data["agent"] for agent_data in agents],
                tasks=[task],
                verbose=True
            )
            
            # Execute the crew
            logger.info("Executing CrewAI crew", execution_id=execution_id)
            result = await asyncio.get_event_loop().run_in_executor(
                None, crew.kickoff
            )
            
            # Calculate token usage and costs (approximation)
            # In a real scenario, you'd track actual API calls
            input_text = f"{task_description} {' '.join([agent['config'].get('backstory', '') for agent in agents])}"
            output_text = str(result)
            
            input_tokens = self.token_counter.count_tokens(input_text)
            output_tokens = self.token_counter.count_tokens(output_text)
            cost = self._calculate_cost(input_tokens, output_tokens, llm_model)
            
            total_input_tokens += input_tokens
            total_output_tokens += output_tokens
            total_cost += cost
            
            # Log agent completions
            for agent_data in agents:
                agent_end_time = time.time()
                duration_ms = int((agent_end_time - agent_data["start_time"]) * 1000)
                
                if telemetry_callback:
                    await telemetry_callback({
                        "event_id": str(uuid4()),
                        "event_type": "agent.end",
                        "timestamp": datetime.utcnow().isoformat(),
                        "trace_context": {
                            "trace_id": execution_id,
                            "span_id": agent_data["span_id"],
                            "parent_span_id": execution_id
                        },
                        "session_id": session_id,
                        "project_id": project_id,
                        "environment": "production",
                        "agent_id": agent_data["config"].get("id", f"agent-{len(agents)}"),
                        "duration_ms": duration_ms,
                        "tokens_used": input_tokens // len(agents),  # Approximate distribution
                        "cost_usd": cost / len(agents),  # Approximate distribution
                        "status": "completed"
                    })
            
            # Log crew completion
            end_time = time.time()
            total_duration_ms = int((end_time - start_time) * 1000)
            
            if telemetry_callback:
                await telemetry_callback({
                    "event_id": str(uuid4()),
                    "event_type": "crew.end",
                    "timestamp": datetime.utcnow().isoformat(),
                    "trace_context": {
                        "trace_id": execution_id,
                        "span_id": str(uuid4()),
                        "parent_span_id": None
                    },
                    "session_id": session_id,
                    "project_id": project_id,
                    "environment": "production",
                    "crew_id": crew_id,
                    "execution_id": execution_id,
                    "duration_ms": total_duration_ms,
                    "total_tokens": total_input_tokens + total_output_tokens,
                    "total_cost": total_cost,
                    "status": "completed",
                    "result_summary": str(result)[:500] + "..." if len(str(result)) > 500 else str(result)
                })
            
            logger.info(
                "CrewAI execution completed",
                execution_id=execution_id,
                duration_ms=total_duration_ms,
                total_tokens=total_input_tokens + total_output_tokens,
                total_cost=total_cost
            )
            
            return {
                "status": "completed",
                "result": str(result),
                "execution_time_ms": total_duration_ms,
                "tokens_used": {
                    "input": total_input_tokens,
                    "output": total_output_tokens,
                    "total": total_input_tokens + total_output_tokens
                },
                "cost_usd": total_cost,
                "model": llm_model,
                "agents_count": len(agents)
            }
            
        except Exception as e:
            logger.error(
                "CrewAI execution failed",
                execution_id=execution_id,
                error=str(e),
                error_type=type(e).__name__
            )
            
            # Log error event
            if telemetry_callback:
                await telemetry_callback({
                    "event_id": str(uuid4()),
                    "event_type": "crew.error",
                    "timestamp": datetime.utcnow().isoformat(),
                    "trace_context": {
                        "trace_id": execution_id,
                        "span_id": str(uuid4()),
                        "parent_span_id": None
                    },
                    "session_id": session_id,
                    "project_id": project_id,
                    "environment": "production",
                    "crew_id": crew_id,
                    "execution_id": execution_id,
                    "error_message": str(e),
                    "error_type": type(e).__name__
                })
            
            return {
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__,
                "execution_time_ms": int((time.time() - start_time) * 1000),
                "tokens_used": {
                    "input": total_input_tokens,
                    "output": total_output_tokens,
                    "total": total_input_tokens + total_output_tokens
                },
                "cost_usd": total_cost
            }


# Global executor instance
_executor: Optional[CrewExecutor] = None


def get_crew_executor() -> CrewExecutor:
    """Get the crew executor instance"""
    global _executor
    if _executor is None:
        _executor = CrewExecutor()
    return _executor
