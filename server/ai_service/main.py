import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
import requests
import json

# --- Configuration ---
load_dotenv()
app = Flask(__name__)

# --- Ollama Configuration ---
OLLAMA_API_URL = "http://localhost:11434"
GENERATOR_MODEL = "qwen3:1.7b" 

# --- Security ---
API_AUTH_TOKEN = os.getenv("AI_SERVICE_AUTH_TOKEN")
if not API_AUTH_TOKEN:
    raise ValueError("AI_SERVICE_AUTH_TOKEN environment variable not set!")

# --- Crisis Keywords for Safety ---
CRISIS_KEYWORDS = ["suicide", "kill myself", "hopeless", "end my life"]

# --- Model & Database Initialization ---
embedding_model = None
knowledge_collection = None
try:
    print("--- Initializing AI Service ---")
    print("Loading embedding model (this may take a moment on first run)...")
    embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
    print("✅ Embedding model loaded.")

    db_client = chromadb.PersistentClient(path="db")
    knowledge_collection = db_client.get_collection(name="clinico_knowledge_base")
    print(f"✅ Connected to ChromaDB. Collection '{knowledge_collection.name}' has {knowledge_collection.count()} entries.")

except Exception as e:
    print(f"❌ An error occurred during initialization: {e}")

# --- Agent Core Functions ---

def determine_intent(user_query: str) -> str:
    """
    Uses the LLM to analyze the user's query and determine their intent.
    This is the core of the AI Orchestrator.
    """
    print(f"Orchestrator: Determining intent for query: '{user_query}'")
    
    # Check for crisis keywords first for immediate routing
    if any(keyword in user_query.lower() for keyword in CRISIS_KEYWORDS):
        print("  -> Intent classified as 'mental_wellness_distress' due to crisis keywords.")
        return "mental_wellness_distress"
        
    system_prompt = (
        "You are an AI orchestrator. Your task is to classify the user's query into one of the following categories: "
        "'health_inquiry' (for general questions about medical conditions, symptoms, or treatments), "
        "'care_coordination' (for requests to find a doctor, book an appointment, or get help with scheduling), "
        "'mental_wellness_distress' (for expressions of sadness, anxiety, stress, or other mental health concerns), "
        "or 'unclear' (if the intent is ambiguous or not related to healthcare). "
        "Respond with only the category name in lowercase."
    )
    
    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/v1/chat/completions",
            json={
                "model": GENERATOR_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "temperature": 0.0 # We want a deterministic classification
            }
        )
        response.raise_for_status()
        intent = response.json()['choices'][0]['message']['content'].strip().lower()
        print(f"  -> Intent classified as '{intent}' by LLM.")
        return intent
    except Exception as e:
        print(f"  -> Error during intent classification: {e}")
        return "unclear" # Default to unclear on error

def handle_health_inquiry(user_query: str):
    """
    The Health Inquiry Agent. Performs RAG to generate a grounded, informative answer.
    """
    print("Agent: Health Inquiry Agent activated.")
    
    # 1. Embed the query and retrieve context from the knowledge base
    query_embedding = embedding_model.encode(user_query).tolist()
    results = knowledge_collection.query(
        query_embeddings=[query_embedding],
        n_results=3,
        include=["documents", "metadatas", "distances"]
    )
    context = "\n---\n".join(results['documents'][0])
    
    # 2. Generate the final answer using the retrieved context
    prompt = (
        "You are a helpful medical AI assistant named Clinico. "
        "Your task is to answer the user's question in a clear, conversational, and helpful manner, based *only* on the context provided below. "
        "Synthesize the information into a proper sentence or paragraph. Do not just list the raw data. "
        "Clean up any formatting issues from the context (like replacing underscores with spaces in words) before presenting the answer.\n\n"
        f"--- CONTEXT ---\n{context}\n\n"
        f"--- QUESTION ---\n{user_query}\n\n"
        "--- HELPFUL ANSWER ---\n"
    )
    
    response = requests.post(
        f"{OLLAMA_API_URL}/v1/chat/completions",
        json={"model": GENERATOR_MODEL, "messages": [{"role": "user", "content": prompt}]}
    )
    response.raise_for_status()
    final_answer = response.json()['choices'][0]['message']['content']
    
    return {
        "agent": "Health Inquiry Agent",
        "response_type": "informational",
        "answer": final_answer,
        "sources": [
            {"source": meta.get('source', 'N/A'), "relevance": 1 - dist}
            for meta, dist in zip(results['metadatas'][0], results['distances'][0])
        ]
    }

def handle_care_coordination(user_query: str):
    """
    The Care Coordinator Agent. Guides the user towards booking an appointment.
    """
    print("Agent: Care Coordinator Agent activated.")
    answer = (
        "It sounds like you're looking for medical care. I can help with that. "
        "To find a doctor near you for an in-person visit, you can use the 'Find a Clinic' map in the app. "
        "If you'd like to book a virtual telehealth appointment, please let me know what specialty you are looking for (e.g., 'I need a psychiatrist')."
    )
    return {
        "agent": "Care Coordinator Agent",
        "response_type": "guidance",
        "answer": answer,
        "sources": []
    }

# --- Main API Endpoint: The AI Orchestrator ---
@app.route('/v1/agent/orchestrate', methods=['POST'])
def orchestrate_agent():
    if not embedding_model or not knowledge_collection:
        return jsonify({"error": "Service is not initialized properly."}), 500

    data = request.json
    user_query = data.get('query')
    if not user_query:
        return jsonify({"error": "Query not provided"}), 400

    try:
        # 1. The Orchestrator determines the user's intent
        intent = determine_intent(user_query)
        
        # 2. Route to the appropriate agent based on intent
        if intent == "health_inquiry" or intent == "mental_wellness_distress":
            response_data = handle_health_inquiry(user_query)
        
        elif intent == "care_coordination":
            response_data = handle_care_coordination(user_query)
            
        else: # Unclear intent
            print("Agent: Fallback - Asking clarifying questions.")
            response_data = {
                "agent": "Orchestrator",
                "response_type": "clarification",
                "answer": "I'm sorry, I'm not sure how to help with that. Could you please rephrase your question or provide more details about what you're looking for?",
                "sources": []
            }
            
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ An error occurred during orchestration: {e}")
        return jsonify({"error": "An error occurred while processing your request."}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)

