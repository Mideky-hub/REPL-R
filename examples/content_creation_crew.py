"""
Example: Content Creation Crew with REPL;ay Observability

This example demonstrates how to use REPL;ay SDK to instrument a CrewAI crew
for content creation with full observability and debugging capabilities.
"""

import os
from typing import List
from crewai import Agent, Task, Crew, LLM
from crewai_tools import SerperDevTool, FileWriterTool

# Import and initialize REPL;ay
import repl_ay
from repl_ay.integrations.crewai import auto_instrument

# Initialize REPL;ay with your API key
repl_ay.initialize(
    api_key=os.getenv("REPL_AY_API_KEY", "demo-key-12345"),
    project_id="content-creation-demo",
    environment="development",
    debug=True
)

# Auto-instrument CrewAI for automatic observability
auto_instrument()

# Initialize tools
search_tool = SerperDevTool()
file_writer = FileWriterTool()

# Define LLM
llm = LLM(
    model="gpt-4",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

def create_content_crew() -> Crew:
    """Create a content creation crew with REPL;ay instrumentation"""
    
    # Research Agent
    researcher = Agent(
        role="Senior Content Researcher",
        goal="Conduct thorough research on given topics and gather comprehensive information",
        backstory="""You are an experienced content researcher with a keen eye for detail. 
        You excel at finding credible sources, identifying key trends, and synthesizing 
        complex information into digestible insights. Your research forms the foundation 
        for high-quality content creation.""",
        tools=[search_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    # Content Writer Agent
    writer = Agent(
        role="Expert Content Writer",
        goal="Create engaging, well-structured content based on research findings",
        backstory="""You are a skilled content writer with years of experience in 
        creating compelling articles, blog posts, and marketing copy. You have a talent 
        for transforming research data into engaging narratives that resonate with the 
        target audience. Your writing is clear, concise, and optimized for both readers 
        and search engines.""",
        tools=[file_writer],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # Editor Agent
    editor = Agent(
        role="Content Editor and Quality Assurance",
        goal="Review and polish content to ensure quality, consistency, and brand alignment",
        backstory="""You are a meticulous editor with an exceptional eye for detail. 
        You ensure that all content meets the highest standards of quality, accuracy, 
        and consistency. You check for grammar, style, tone, and brand alignment while 
        also optimizing content for SEO and readability.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # Define tasks
    research_task = Task(
        description="""Conduct comprehensive research on '{topic}' including:
        1. Current trends and developments
        2. Key statistics and data points
        3. Expert opinions and insights
        4. Competitive landscape analysis
        5. Target audience preferences
        
        Provide a detailed research report with credible sources.""",
        expected_output="A comprehensive research report with key findings, statistics, trends, and source citations",
        agent=researcher
    )
    
    writing_task = Task(
        description="""Based on the research findings, create an engaging article about '{topic}' that:
        1. Has a compelling headline and introduction
        2. Is structured with clear sections and subheadings
        3. Incorporates key research findings naturally
        4. Includes actionable insights for readers
        5. Has a strong conclusion with key takeaways
        6. Is optimized for SEO and readability
        
        Target length: 1500-2000 words.""",
        expected_output="A well-structured, engaging article saved to a file with proper formatting and SEO optimization",
        agent=writer,
        dependencies=[research_task]
    )
    
    editing_task = Task(
        description="""Review and edit the written content to ensure:
        1. Grammar, spelling, and punctuation are perfect
        2. Tone and style are consistent throughout
        3. Content flows logically and engagingly
        4. SEO elements are properly optimized
        5. Facts and claims are accurate and well-supported
        6. Content meets brand guidelines and quality standards
        
        Provide the final, polished version.""",
        expected_output="A polished, final version of the article with all edits and improvements noted",
        agent=editor,
        dependencies=[writing_task]
    )
    
    # Create and return the crew
    crew = Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, writing_task, editing_task],
        verbose=True,
        process_type="sequential",
        memory=True,
        cache=True,
        max_rpm=10,  # Rate limiting
        share_crew=False
    )
    
    return crew


def run_content_creation_example(topic: str = "AI Agents in Business Automation"):
    """
    Run the content creation crew with REPL;ay observability
    
    Args:
        topic: The topic for content creation
    """
    print(f"🚀 Starting content creation for topic: {topic}")
    print("📊 This crew run will be fully traced in REPL;ay!")
    
    try:
        # Create the crew
        crew = create_content_crew()
        
        # Execute the crew with the topic
        result = crew.kickoff(inputs={"topic": topic})
        
        print("\n✅ Content creation completed successfully!")
        print(f"📝 Result: {result}")
        
        # Flush any remaining events to REPL;ay
        repl_ay.get_client().flush()
        
        return result
        
    except Exception as e:
        print(f"❌ Error during content creation: {e}")
        # The error will be automatically tracked by REPL;ay
        raise


def run_multiple_topics_example():
    """
    Example running multiple topics to generate more telemetry data
    """
    topics = [
        "AI Agents in Business Automation",
        "The Future of Remote Work Technology", 
        "Sustainable Technology Trends 2024",
        "Cybersecurity for Small Businesses"
    ]
    
    results = []
    
    for i, topic in enumerate(topics, 1):
        print(f"\n🎯 Running content creation {i}/{len(topics)}: {topic}")
        
        try:
            result = run_content_creation_example(topic)
            results.append({"topic": topic, "status": "success", "result": result})
        except Exception as e:
            print(f"❌ Failed for topic '{topic}': {e}")
            results.append({"topic": topic, "status": "error", "error": str(e)})
    
    # Summary
    successful = len([r for r in results if r["status"] == "success"])
    failed = len([r for r in results if r["status"] == "error"])
    
    print(f"\n📊 Batch Summary:")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total telemetry events sent to REPL;ay")
    
    return results


if __name__ == "__main__":
    print("🔍 REPL;ay CrewAI Content Creation Example")
    print("=" * 50)
    
    # Check if API keys are set
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY not set. Using mock responses.")
    
    if not os.getenv("SERPER_API_KEY"):
        print("⚠️  SERPER_API_KEY not set. Search functionality may be limited.")
    
    # Run single example
    print("\n1️⃣  Running single topic example...")
    run_content_creation_example()
    
    # Uncomment to run multiple topics for more telemetry data
    # print("\n2️⃣  Running multiple topics example...")
    # run_multiple_topics_example()
    
    print("\n🎉 Example completed! Check your REPL;ay dashboard for observability data.")
    print("🌐 Dashboard: https://app.repl-ay.dev (when deployed)")
    print("📚 Documentation: https://docs.repl-ay.dev")
