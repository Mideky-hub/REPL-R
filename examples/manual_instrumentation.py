"""
Simple manual instrumentation example without CrewAI dependencies

This shows how to use REPL;ay SDK decorators to instrument any Python function.
"""

import time
import random
from typing import Dict, Any

# Import REPL;ay SDK
import repl_ay
from repl_ay import trace_agent, trace_task, trace_tool, trace_llm_call

# Initialize REPL;ay
repl_ay.initialize(
    api_key="demo-key-12345",
    project_id="manual-instrumentation-demo",
    environment="development", 
    debug=True
)

# Mock LLM response class for demonstration
class MockLLMResponse:
    def __init__(self, content: str, tokens: int):
        self.choices = [type('obj', (object,), {
            'message': type('obj', (object,), {'content': content})()
        })()]
        self.usage = type('obj', (object,), {
            'total_tokens': tokens,
            'prompt_tokens': int(tokens * 0.7),
            'completion_tokens': int(tokens * 0.3)
        })()

@trace_llm_call(model_name="gpt-4", provider="openai")
def call_llm(prompt: str) -> MockLLMResponse:
    """Simulate an LLM call"""
    time.sleep(random.uniform(0.5, 2.0))  # Simulate API latency
    
    # Simulate different responses based on prompt
    if "research" in prompt.lower():
        return MockLLMResponse("Here are the research findings...", 850)
    elif "write" in prompt.lower():
        return MockLLMResponse("Here's the written content...", 1200)
    else:
        return MockLLMResponse("Here's the response...", 600)

@trace_tool(name="web_scraper")
def scrape_website(url: str) -> Dict[str, Any]:
    """Simulate web scraping"""
    time.sleep(random.uniform(1.0, 3.0))  # Simulate scraping time
    
    if random.random() < 0.1:  # 10% chance of failure
        raise Exception(f"Failed to scrape {url}: Connection timeout")
    
    return {
        "url": url,
        "title": f"Article from {url}",
        "content": f"This is content scraped from {url}",
        "word_count": random.randint(500, 2000)
    }

@trace_tool(name="data_processor")
def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Process scraped data"""
    time.sleep(random.uniform(0.2, 0.8))
    
    processed = {
        "original_url": data.get("url"),
        "processed_content": data.get("content", "").upper(),
        "summary": f"Summary of {data.get('title', 'content')}",
        "key_points": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
        ]
    }
    
    return processed

@trace_task(
    name="Research Task",
    description="Gather information from multiple sources",
    expected_output="Comprehensive research report"
)
def research_task(topic: str) -> Dict[str, Any]:
    """Execute a research task"""
    print(f"🔍 Researching topic: {topic}")
    
    # Simulate multiple data sources
    sources = [
        f"https://example.com/articles/{topic.replace(' ', '-').lower()}",
        f"https://news.com/tech/{topic.replace(' ', '-').lower()}",
        f"https://research.org/papers/{topic.replace(' ', '-').lower()}"
    ]
    
    research_results = []
    
    for source in sources:
        try:
            # Use traced tools
            scraped_data = scrape_website(source)
            processed_data = process_data(scraped_data)
            research_results.append(processed_data)
            
        except Exception as e:
            print(f"⚠️  Failed to process {source}: {e}")
            continue
    
    # Generate final report using LLM
    prompt = f"Create a research report about {topic} based on the following sources: {research_results}"
    llm_response = call_llm(prompt)
    
    return {
        "topic": topic,
        "sources_processed": len(research_results),
        "research_data": research_results,
        "final_report": llm_response.choices[0].message.content,
        "total_tokens": llm_response.usage.total_tokens
    }

@trace_task(
    name="Writing Task", 
    description="Create content based on research",
    expected_output="Well-written article"
)
def writing_task(research_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a writing task"""
    print(f"✍️  Writing content for: {research_data['topic']}")
    
    # Generate article using LLM
    prompt = f"Write a comprehensive article about {research_data['topic']} based on: {research_data['final_report']}"
    llm_response = call_llm(prompt)
    
    # Simulate some processing time
    time.sleep(random.uniform(1.0, 2.0))
    
    return {
        "topic": research_data['topic'],
        "article": llm_response.choices[0].message.content,
        "word_count": random.randint(800, 1500),
        "tokens_used": llm_response.usage.total_tokens
    }

@trace_agent(
    name="Content Creator Agent",
    role="content_creator",
    goal="Create high-quality content based on research"
)
def content_creator_agent(topic: str) -> Dict[str, Any]:
    """Main agent that coordinates research and writing"""
    print(f"🤖 Content Creator Agent starting work on: {topic}")
    
    try:
        # Execute research task
        research_result = research_task(topic)
        
        # Execute writing task 
        writing_result = writing_task(research_result)
        
        # Combine results
        final_result = {
            "status": "completed",
            "topic": topic,
            "research_summary": {
                "sources_processed": research_result["sources_processed"],
                "total_research_tokens": research_result["total_tokens"]
            },
            "article_summary": {
                "word_count": writing_result["word_count"],
                "writing_tokens": writing_result["tokens_used"]
            },
            "total_cost_estimate": random.uniform(0.50, 2.00),
            "execution_time": time.time()
        }
        
        print("✅ Content creation completed successfully!")
        return final_result
        
    except Exception as e:
        print(f"❌ Content creation failed: {e}")
        raise

def run_demonstration():
    """Run a demonstration of the instrumented workflow"""
    
    topics = [
        "Artificial Intelligence in Healthcare",
        "Sustainable Energy Solutions", 
        "Future of Remote Work"
    ]
    
    print("🚀 REPL;ay Manual Instrumentation Demo")
    print("=" * 50)
    
    results = []
    
    for i, topic in enumerate(topics, 1):
        print(f"\n📝 Processing {i}/{len(topics)}: {topic}")
        
        try:
            result = content_creator_agent(topic)
            results.append(result)
            
            print(f"💰 Estimated cost: ${result['total_cost_estimate']:.2f}")
            
        except Exception as e:
            print(f"💥 Failed: {e}")
            results.append({"status": "failed", "topic": topic, "error": str(e)})
        
        # Small delay between runs
        time.sleep(1)
    
    # Summary
    successful = len([r for r in results if r.get("status") == "completed"])
    failed = len(results) - successful
    
    print(f"\n📊 Demo Summary:")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 All events tracked in REPL;ay!")
    
    # Flush any remaining events
    client = repl_ay.get_client()
    if client:
        client.flush()
        print("📤 Events flushed to REPL;ay")
    
    return results

if __name__ == "__main__":
    run_demonstration()
