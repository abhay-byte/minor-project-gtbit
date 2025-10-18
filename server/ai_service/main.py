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

# --- Ollama Configuration (for Generation) ---
OLLAMA_API_URL = "http://localhost:11434"
GENERATOR_MODEL = "qwen3:8b" 

# --- Security ---
API_AUTH_TOKEN = os.getenv("AI_SERVICE_AUTH_TOKEN")
if not API_AUTH_TOKEN:
    raise ValueError("AI_SERVICE_AUTH_TOKEN environment variable not set!")

# --- Model & Database Initialization ---
embedding_model = None
knowledge_collection = None
try:
    print("--- Initializing AI Service ---")
    
    print("Loading embedding model 'sentence-transformers/all-MiniLM-L6-v2'...")
    embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cuda')
    print("Embedding model loaded.")

    print(f"Checking connection to Ollama server at {OLLAMA_API_URL} for generation...")
    requests.get(OLLAMA_API_URL, timeout=5)
    print("Ollama server is responsive.")

    db_client = chromadb.PersistentClient(path="db")
    knowledge_collection = db_client.get_collection(name="clinico_knowledge_base")
    print(f"Connected to ChromaDB. Collection '{knowledge_collection.name}' has {knowledge_collection.count()} entries.")

except requests.exceptions.ConnectionError:
    print(f"CRITICAL ERROR: Could not connect to the Ollama server at {OLLAMA_API_URL}.")
    print("   Please ensure the Ollama application is running.")
except Exception as e:
    print(f"An error occurred during initialization: {e}")

@app.before_request
def check_auth_token():
    if request.path in ['/rag_query', '/semantic_search']:
        auth_header = request.headers.get('Authorization')
        if not auth_header or f"Bearer {API_AUTH_TOKEN}" != auth_header:
            return jsonify({"error": "Unauthorized"}), 401

@app.route('/semantic_search', methods=['POST'])
def semantic_search():
    if not embedding_model or not knowledge_collection:
        return jsonify({"error": "Service is not initialized properly."}), 500

    data = request.json
    user_query = data.get('query')
    if not user_query:
        return jsonify({"error": "Query not provided"}), 400

    try:
        print(f"Embedding search query: '{user_query}'")
        query_embedding = embedding_model.encode(user_query).tolist()

        print("Searching vector database for relevant documents...")
        results = knowledge_collection.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=["documents", "metadatas", "distances"]
        )
        
        retrieved_documents = [
            {
                "content": doc,
                "source": meta.get('source', 'N/A'),
                "relevance_score": 1 - dist
            } for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0])
        ]
        
        return jsonify(retrieved_documents)

    except Exception as e:
        print(f"An error occurred during semantic search: {e}")
        return jsonify({"error": "An error occurred while processing your search."}), 500


@app.route('/rag_query', methods=['POST'])
def rag_query():
    if not embedding_model or not knowledge_collection:
        return jsonify({"error": "Service is not initialized properly."}), 500

    data = request.json
    user_query = data.get('query')
    if not user_query:
        return jsonify({"error": "Query not provided"}), 400

    try:
        # 1. Embed and retrieve documents using SentenceTransformer
        query_embedding = embedding_model.encode(user_query).tolist()
        results = knowledge_collection.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=["documents", "metadatas", "distances"]
        )
        
        context_docs = results['documents'][0]
        context = "\n---\n".join(context_docs)
        
        prompt = (
            "You are a helpful medical AI assistant named Clinico. "
            "Your task is to answer the user's question in a clear, conversational, and helpful manner, based *only* on the context provided below. "
            "Synthesize the information into a proper sentence or paragraph. Do not just list the raw data. "
            "Clean up any formatting issues from the context (like replacing underscores with spaces in words) before presenting the answer.\n\n"
            f"--- CONTEXT ---\n{context}\n\n"
            f"--- QUESTION ---\n{user_query}\n\n"
            "--- HELPFUL ANSWER ---\n"
        )

        ollama_response = requests.post(
            f"{OLLAMA_API_URL}/v1/chat/completions",
            json={
                "model": GENERATOR_MODEL,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        ollama_response.raise_for_status()
        
        final_answer = ollama_response.json()['choices'][0]['message']['content']
        
        response_data = {
            "answer": final_answer,
            "sources": [
                {
                    "content": doc,
                    "source": meta.get('source', 'N/A'),
                    "relevance": 1 - dist
                } for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0])
            ]
        }
        
        return jsonify(response_data)

    except Exception as e:
        print(f"An error occurred during RAG query: {e}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)

