import os
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from tavily import TavilyClient
import operator
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class GraphState(TypedDict):
    """Represents the state of our graph."""
    original_query: str
    cleaned_query: str
    search_results: List[dict]
    compiled_answer: str
    follow_up_questions: List[str]
    messages: Annotated[List[str], operator.add]
    conversation_history: str
    verified_sources: bool

class FootballQASystem:
    def __init__(self):
        # Initialize APIs
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        self.tavily_client = TavilyClient(
            api_key=os.getenv("TAVILY_API_KEY")
        )
        
        # Build the graph
        self.app = self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("query_cleaner", self._clean_query)
        workflow.add_node("search_agent", self._search_football_info)
        workflow.add_node("answer_compiler", self._compile_answer)
        workflow.add_node("follow_up_generator", self._generate_follow_up_questions)
        
        # Define the workflow
        workflow.set_entry_point("query_cleaner")
        workflow.add_edge("query_cleaner", "search_agent")
        workflow.add_edge("search_agent", "answer_compiler")
        workflow.add_edge("answer_compiler", "follow_up_generator")
        workflow.add_edge("follow_up_generator", END)
        
        return workflow.compile()

    def _clean_query(self, state: GraphState) -> dict:
        """Agent 1: Query Cleaning Agent - Optimizes the user's question for search"""
        
        system_prompt = f"""You are a query optimization specialist for football searches.
        
        Your job is to take a user's football question and rewrite it to be more effective for web search.
        Consider the conversation history to understand context and follow-up questions.
        
        Guidelines:
        1. Add relevant keywords (NFL, fantasy football, player names, etc.)
        2. Make the query more specific and searchable
        3. Remove conversational elements
        4. Focus on the core information need
        5. Consider current NFL season context (2025-2026)
        6. If this appears to be a follow-up question, incorporate context from previous questions
        
        Examples:
        - "Is Travis Kelce good this week?" → "Travis Kelce week 8 2025 fantasy football matchup injury report"
        - "Should I start my QB?" → "NFL quarterback rankings week 2025 fantasy football start sit"
        - "Tell me about the Chiefs" → "Kansas City Chiefs 2025 season stats news updates"
        
        {state['conversation_history']}
        
        Return only the optimized search query, nothing else."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Current question: {state['original_query']}")
        ]
        
        try:
            response = self.llm.invoke(messages)
            cleaned_query = response.content.strip()
            
            return {
                "cleaned_query": cleaned_query,
                "messages": [f"🧹 Cleaned query: '{cleaned_query}'"]
            }
        except Exception as e:
            return {
                "cleaned_query": state['original_query'],  # Fallback to original
                "messages": [f"Query cleaning failed, using original: {str(e)}"]
            }
    
    def _search_football_info(self, state: GraphState) -> dict:
        """Agent 2: Search Agent - Uses Tavily to gather relevant football information"""
        try:
            include_domains = []
            if state["verified_sources"]:
                include_domains = [
                    "espn.com", "nfl.com", "fantasypros.com", "yahoo.com", "cbs.com",
                    "bleacherreport.com", "profootballfocus.com", "rotoworld.com",
                    "theathletic.com", "si.com", "foxsports.com", "usatoday.com",
                    "draftkings.com", "numberfire.com", "pro-football-reference.com"
                ]

            search_results = self.tavily_client.search(
                query=state["cleaned_query"],
                search_depth="advanced",
                include_domains=include_domains,
                max_results=5
            )
            
            # Process results
            processed_results = []
            if 'results' in search_results:
                for result in search_results['results']:
                    processed_results.append({
                        'title': result.get('title', 'No title'),
                        'content': result.get('content', 'No content'),
                        'url': result.get('url', ''),
                        'score': result.get('score', 0)
                    })
            
            return {
                "search_results": processed_results,
                "messages": [f"🔍 Found {len(processed_results)} relevant sources"]
            }
            
        except Exception as e:
            return {
                "search_results": [],
                "messages": [f"Search failed: {str(e)}"]
            }
    
    def _compile_answer(self, state: GraphState) -> dict:
        """Agent 3: Answer Compilation Agent - Synthesizes search results into a comprehensive answer"""
        if not state["search_results"]:
            return {
                "compiled_answer": "I apologize, but I couldn't find relevant information to answer your question. Please try rephrasing your question or check your internet connection.",
                "messages": ["No search results to compile"]
            }
        
        # Prepare context from search results
        search_context = ""
        for i, result in enumerate(state["search_results"], 1):
            search_context += f"\nSource {i}:\n"
            search_context += f"Title: {result['title']}\n"
            search_context += f"Content: {result['content'][:800]}...\n"
            search_context += f"URL: {result['url']}\n"
            search_context += "-" * 50 + "\n"
        
        system_prompt = f"""You are an expert football analyst who synthesizes information from multiple sources and maintains conversation context.

        Your task is to answer the user's football question using the provided search results while considering the conversation history.

        Guidelines:
        1. Provide a direct, comprehensive answer to the current question
        2. Use specific data, stats, and facts from the sources
        3. Mention sources when using specific information (e.g., "According to ESPN..." or "Per NFL.com...")
        4. Consider conversation history for context - if this seems like a follow-up question, acknowledge the connection
        5. If conflicting information exists, acknowledge it
        6. Be concise but thorough
        7. Use a conversational but informative tone
        8. Use new line characters where appropriate
        9. If the search results don't fully answer the question, say so
        10. For follow-up questions, reference previous context naturally
        11. When citing a source, include the index of the source in the answer in the format "[(X)]", ex. "[(1)]"

        Current Question: {state['original_query']}
        Search Query Used: {state['cleaned_query']}
        
        {state['conversation_history']}

        Current Search Results:
        {search_context}

        Provide a well-structured answer that directly addresses the user's current question while being aware of the conversation context."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content="Please compile the answer based on the search results and conversation context.")
        ]
        
        try:
            response = self.llm.invoke(messages)
            compiled_answer = response.content.strip()
            
            return {
                "compiled_answer": compiled_answer,
                "messages": [f"✅ Answer compiled from {len(state['search_results'])} sources with conversation context"]
            }
        except Exception as e:
            return {
                "compiled_answer": f"I found relevant information but encountered an error while compiling the answer: {str(e)}",
                "messages": [f"Answer compilation failed: {str(e)}"]
            }
    
    def _generate_follow_up_questions(self, state: GraphState) -> dict:
        """Agent 4: Follow-up Question Generator - Creates relevant follow-up questions"""
        
        system_prompt = f"""You are an expert football analyst who generates thoughtful, relevant follow-up questions.

        Your task is to generate follow-up questions that a user might ask next, given the previous question and answer.

        Guidelines:
        1. Generate 2–4 natural follow-up questions
        2. Use stats, facts, or themes from the sources to inspire follow-ups
        3. Reference prior conversation naturally
        4. Keep follow-ups clear, specific, and conversational
        5. Keep each follow-up question under 100 characters
        6. Return ONLY a JSON array of brief follow-up questions, no other text

        Current Question: {state['original_query']}
        {state['conversation_history']}
        
        Current Answer:
        {state['compiled_answer']}

        Return format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]
        """
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content="Please generate follow-up questions based on the previous question and answer.")
        ]
        
        try:
            response = self.llm.invoke(messages)
            follow_up_response = response.content.strip()
            
            # Parse the JSON response
            try:
                follow_up_questions = json.loads(follow_up_response)
                if not isinstance(follow_up_questions, list):
                    follow_up_questions = [follow_up_response]
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                follow_up_questions = [follow_up_response]
            
            return {
                "follow_up_questions": follow_up_questions,
                "messages": [f"✅ Generated {len(follow_up_questions)} follow-up questions"]
            }
            
        except Exception as e:
            return {
                "follow_up_questions": [],
                "messages": [f"Follow-up generation failed: {str(e)}"]
            }
    
    def _format_conversation_history(self, conversation_history_list: List[dict]) -> str:
        """Formats the conversation history into a string"""
        if not conversation_history_list:
            return ""
            
        conversation_context = "\n\nPrevious Conversation Context:\n"
        for i, entry in enumerate(conversation_history_list[-3:], 1):  # Last 3 exchanges
            conversation_context += f"{i}. Previous Q: {entry['question']}\n"
            conversation_context += f"   Previous A: {entry['answer'][:300]}...\n\n"
        
        return conversation_context
    
    def ask_question(self, question: str, conversation_history_list: List[dict] = None, verified_sources: bool = False) -> dict:
        """Main interface to ask a football question with conversation history"""
        
        conversation_history = self._format_conversation_history(conversation_history_list or [])

        initial_state = {
            "original_query": question,
            "cleaned_query": "",
            "search_results": [],
            "compiled_answer": "",
            "follow_up_questions": [],
            "messages": [],
            "conversation_history": conversation_history,
            "verified_sources": verified_sources
        }
        
        try:
            # Run the graph
            result = self.app.invoke(initial_state)
            
            return {
                "question": question,
                "cleaned_query": result.get("cleaned_query", ""),
                "sources_found": result.get("search_results", []),
                "answer": result.get("compiled_answer", ""),
                "processing_steps": result.get("messages", []),
                "follow_up_questions": result.get("follow_up_questions", []),
                "verified_sources": verified_sources
            }
        except Exception as e:
            return {
                "question": question,
                "cleaned_query": "",
                "sources_found": [],
                "answer": f"System error: {str(e)}",
                "processing_steps": [f"System error: {str(e)}"],
                "follow_up_questions": [],
                "verified_sources": verified_sources
            }