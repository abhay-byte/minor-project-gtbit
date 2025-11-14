import os
import time
from flask import Flask, request, jsonify
import jwt
from functools import wraps
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
import requests
import json
import base64
from io import BytesIO
from PIL import Image
from google import genai
from rate_limiter import rate_limit, get_rate_limit_status
from monitoring import (
    metrics, monitor_request, log_agent_usage, log_collection_query,
    log_image_processing, log_crisis_detection, HealthCheck
)

# --- Configuration ---
load_dotenv()
app = Flask(__name__)
API_KEY = os.getenv("GOOGLE_API_KEY")
use_gemini=True

# --- Ollama Configuration ---
OLLAMA_API_URL = "http://localhost:11434"
GENERATOR_MODEL = "qwen3:0.6b"
VISION_MODEL = "qwen2.5vl:3b"  # Vision model for image analysis
GEMINI_MODEL = "gemini-2.5-flash-lite"

# --- Security ---
API_AUTH_TOKEN = os.getenv("AI_SERVICE_AUTH_TOKEN")
if not API_AUTH_TOKEN:
    raise ValueError("AI_SERVICE_AUTH_TOKEN environment variable not set!")
NODE_SERVER_URL = os.getenv("NODE_SERVER_URL", "http://localhost:5000")
JWT_SECRET = os.getenv("JWT_SECRET") 
ai_server_port = os.getenv("AI_SERVICE_PORT")

# --- Crisis Keywords for Safety ---
CRISIS_KEYWORDS = ["suicide", "kill myself", "hopeless", "end my life", "want to die", "self harm"]

if not JWT_SECRET:
    print("⚠️  Warning: JWT_SECRET not set. User authentication will not work.")

from google import genai

client = genai.Client(api_key=API_KEY)

def get_final_answer(prompt: str):
    try:
        if use_gemini:
            # --- GEMINI MODE ---
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            final_answer = response.text

        else:
            # --- LOCAL OLLAMA MODE ---
            response = requests.post(
                f"{OLLAMA_API_URL}/v1/chat/completions",
                json={
                    "model": GENERATOR_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            final_answer = response.json()['choices'][0]['message']['content']

        return final_answer

    except Exception as e:
        print("Error generating answer:", e)
        return "An error occurred while generating the response."

def call_model(system_prompt: str, user_query: str):
    if use_gemini:
        # GEMINI VERSION
        full_prompt = f"{system_prompt}\n\nUser: {user_query}"
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt,
            config={
                "temperature": 0.0
            }
        )
        return response.text.strip()
    else:
        # LOCAL OLLAMA VERSION
        response = requests.post(
            f"{OLLAMA_API_URL}/v1/chat/completions",
            json={
                "model": GENERATOR_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "temperature": 0.0
            }
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()

def get_specialization(prompt: str):
    """
    Returns specialization based on the given prompt.
    Uses Gemini or local Ollama depending on `use_gemini`.
    Falls back to 'General Physician' on any error.
    """
    try:
        if use_gemini:
            # --- GEMINI VERSION ---
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "temperature": 0.0
                }
            )
            specialization = response.text.strip()

        else:
            # --- LOCAL OLLAMA VERSION ---
            response = requests.post(
                f"{OLLAMA_API_URL}/v1/chat/completions",
                json={
                    "model": GENERATOR_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.0
                }
            )
            specialization = response.json()['choices'][0]['message']['content'].strip()

        return specialization

    except Exception as e:
        print("Specialization error:", e)
        return "General Physician"

def verify_user_token(f):
    """
    Decorator to verify JWT token from Node.js server.
    Extracts user information and adds it to request context.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                "error": "Unauthorized",
                "message": "A token is required for authentication."
            }), 403
        
        # Extract token from "Bearer <token>"
        token_parts = auth_header.split(' ')
        if len(token_parts) != 2 or token_parts[0] != 'Bearer':
            return jsonify({
                "error": "Unauthorized", 
                "message": "Invalid authorization header format. Use 'Bearer <token>'."
            }), 401
        
        token = token_parts[1]
        
        try:
            # Verify and decode the JWT token
            decoded = jwt.decode(
                token, 
                JWT_SECRET, 
                algorithms=["HS256"]
            )
            
            # Attach user information to request
            request.user = {
                'user_id': decoded.get('userId'),
                'email': decoded.get('email'),
                'role': decoded.get('role'),
                'full_name': decoded.get('fullName')
            }
            
            print(f"✓ Authenticated user: {request.user['email']} (ID: {request.user['user_id']}, Role: {request.user['role']})")
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                "error": "Unauthorized",
                "message": "Token has expired. Please login again."
            }), 401
            
        except jwt.InvalidTokenError as e:
            return jsonify({
                "error": "Unauthorized",
                "message": f"Invalid token: {str(e)}"
            }), 401
        
        except Exception as e:
            print(f"❌ Token verification error: {e}")
            return jsonify({
                "error": "Unauthorized",
                "message": "Token verification failed."
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def log_chat_to_database(user_id: int, message: str, sender: str):
    """
    Log chat messages to Node.js server database via API.
    
    Args:
        user_id: The user's ID
        message: The message content
        sender: 'User' or 'AI'
    """
    try:
        response = requests.post(
            f"{NODE_SERVER_URL}/api/chat/log",
            json={
                "user_id": user_id,
                "message_content": message,
                "sender": sender
            },
            headers={
                "Content-Type": "application/json",
                "X-Internal-Service": API_AUTH_TOKEN  # Internal service auth
            },
            timeout=5
        )
        
        if response.status_code == 201:
            print(f"✓ Chat logged for user {user_id}")
        else:
            print(f"⚠️  Failed to log chat: {response.status_code}")
            
    except Exception as e:
        print(f"⚠️  Error logging chat: {e}")
        # Don't fail the request if logging fails

def fetch_professionals_from_api(specialty: str = None) -> list:
    """
    Fetch verified professionals from Node.js API.
    
    Args:
        specialty: Optional specialty filter (e.g., 'Psychiatrist', 'Cardiologist')
    
    Returns:
        List of professional dictionaries
    """
    try:
        url = f"{NODE_SERVER_URL}/api/professionals"
        params = {}
        
        if specialty:
            params['specialty'] = specialty
        
        print(f"  📡 Fetching professionals from API (specialty: {specialty or 'all'})")
        
        response = requests.get(
            url,
            params=params,
            timeout=10
        )
        response.raise_for_status()
        
        professionals = response.json()
        print(f"  ✓ Found {len(professionals)} professionals")
        
        return professionals
        
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  Error fetching professionals: {e}")
        return []
    except Exception as e:
        print(f"  ⚠️  Unexpected error: {e}")
        return []

def fetch_professional_availability(professional_id: int) -> list:
    """
    Fetch available time slots for a specific professional.
    
    Args:
        professional_id: The professional's ID
    
    Returns:
        List of available time slot dictionaries
    """
    try:
        url = f"{NODE_SERVER_URL}/api/professionals/{professional_id}/availability"
        
        print(f"  📡 Fetching availability for professional {professional_id}")
        
        response = requests.get(
            url,
            timeout=10
        )
        response.raise_for_status()
        
        slots = response.json()
        print(f"  ✓ Found {len(slots)} available slots")
        
        return slots
        
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  Error fetching availability: {e}")
        return []
    except Exception as e:
        print(f"  ⚠️  Unexpected error: {e}")
        return []

def format_availability_text(slots: list) -> str:
    """
    Format availability slots into human-readable text.
    
    Args:
        slots: List of time slot dictionaries
    
    Returns:
        Formatted availability string
    """
    if not slots:
        return "No available slots"
    
    from datetime import datetime
    
    # Group by date
    by_date = {}
    for slot in slots[:5]:  # Show first 5 slots
        try:
            start_time = datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
            date_key = start_time.strftime('%Y-%m-%d')
            time_str = start_time.strftime('%I:%M %p')
            
            if date_key not in by_date:
                by_date[date_key] = []
            by_date[date_key].append(time_str)
        except:
            continue
    
    if not by_date:
        return "Available (contact for timing)"
    
    # Format output
    availability_parts = []
    for date, times in list(by_date.items())[:3]:  # Show max 3 dates
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        date_str = date_obj.strftime('%b %d')
        times_str = ', '.join(times[:2])  # Show max 2 times per date
        availability_parts.append(f"{date_str}: {times_str}")
    
    return " | ".join(availability_parts)

def detect_emergency_situation(user_query: str) -> dict:
    """
    Detect if the user is in an emergency/crisis situation requiring immediate help.
    """
    # Emergency keywords
    emergency_keywords = [
        "emergency", "urgent", "critical", "heart attack", "chest pain", "severe pain",
        "bleeding heavily", "can't breathe", "difficulty breathing", "unconscious",
        "stroke", "seizure", "severe injury", "accident", "poisoning", "overdose"
    ]
    
    # Mental health crisis keywords
    mental_crisis_keywords = [
        "suicide", "kill myself", "end my life", "want to die", "self harm",
        "going to hurt myself", "no reason to live"
    ]
    
    query_lower = user_query.lower()
    
    # Check for medical emergency
    if any(keyword in query_lower for keyword in emergency_keywords):
        return {
            "is_emergency": True,
            "type": "medical",
            "severity": "critical"
        }
    
    # Check for mental health crisis
    if any(keyword in query_lower for keyword in mental_crisis_keywords):
        return {
            "is_emergency": True,
            "type": "mental_health",
            "severity": "critical"
        }
    
    return {
        "is_emergency": False,
        "type": None,
        "severity": "normal"
    }

# --- Model & Database Initialization ---
embedding_model = None
client = genai.Client(api_key=API_KEY)
collections = {}

try:
    print("--- Initializing AI Service ---")
    print("Loading embedding model (this may take a moment on first run)...")
    embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cuda')
    print("✅ Embedding model loaded.")

    db_client = chromadb.PersistentClient(path="db")
    
    # Load all available collections
    available_collections = db_client.list_collections()
    print(f"\n📚 Available collections: {[col.name for col in available_collections]}")
    
    # Map collections by subdirectory name
    for collection in available_collections:
        # Extract subdirectory name from collection name (format: clinico_{subdir})
        if collection.name.startswith("clinico_"):
            subdir_name = collection.name.replace("clinico_", "")
            collections[subdir_name] = collection
            print(f"✅ Loaded collection '{collection.name}' with {collection.count()} entries")
    
    if not collections:
        raise ValueError("No collections found in database. Please run ingest.py first.")

except Exception as e:
    print(f"❌ An error occurred during initialization: {e}")

# --- Agent Core Functions ---

def retrieve_context_from_collections(user_query: str, collection_names: list, n_results: int = 3) -> dict:
    """
    Retrieve context from multiple specified collections.
    Returns combined context with source tracking.
    """
    all_results = []
    
    query_embedding = embedding_model.encode(user_query).tolist()
    
    for col_name in collection_names:
        if col_name not in collections:
            print(f"  ⚠️  Collection '{col_name}' not found, skipping...")
            continue
        
        collection = collections[col_name]
        print(f"  📖 Querying collection: {collection.name}")
        
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0]):
                all_results.append({
                    'document': doc,
                    'metadata': meta,
                    'distance': dist,
                    'collection': col_name,
                    'relevance': 1 - dist
                })
        
        except Exception as e:
            print(f"  ⚠️  Error querying collection '{col_name}': {e}")
    
    # Sort by relevance
    all_results.sort(key=lambda x: x['relevance'], reverse=True)
    
    # Return top results
    top_results = all_results[:n_results * len(collection_names)]
    
    return {
        'results': top_results,
        'context': "\n---\n".join([r['document'] for r in top_results])
    }

def handle_health_inquiry(user_query: str, collection_names: list):
    """
    The Health Inquiry Agent. Performs RAG from specified collections.
    """
    print("🏥 Agent: Health Inquiry Agent activated.")
    
    # Retrieve context from relevant collections
    retrieval = retrieve_context_from_collections(user_query, collection_names, n_results=3)
    context = retrieval['context']
    
    if not context.strip():
        return {
            "agent": "Health Inquiry Agent",
            "response_type": "no_information",
            "answer": "I apologize, but I don't have specific information about that in my knowledge base. Could you rephrase your question or ask about a related topic?",
            "sources": []
        }
    
    # Generate the final answer using the retrieved context
    prompt = (
        "You are Clinico, a helpful medical AI assistant. "
        "Answer the user's question clearly and conversationally based ONLY on the context provided below. "
        "Synthesize the information into proper sentences or paragraphs. "
        "Clean up any formatting issues (like replacing underscores with spaces). "
        "If the context doesn't contain relevant information, say so politely.\n\n"
        f"--- CONTEXT ---\n{context}\n\n"
        f"--- QUESTION ---\n{user_query}\n\n"
        "--- HELPFUL ANSWER ---\n"
    )
    
    try:
        final_answer = get_final_answer(prompt)
    except Exception as e:
        print(f"  ⚠️  Error generating answer: {e}")
        final_answer = "I apologize, but I encountered an error generating a response. Please try again."
    
    return {
        "agent": "Health Inquiry Agent",
        "response_type": "informational",
        "answer": final_answer,
        "sources": [
            {
                "source": r['metadata'].get('source', 'N/A'),
                "collection": r['collection'],
                "relevance": round(r['relevance'], 3)
            }
            for r in retrieval['results'][:5]
        ]
    }

def handle_medicine_inquiry(user_query: str):
    """
    The Medicine Inquiry Agent. Specialized for medicine-related queries.
    """
    print("💊 Agent: Medicine Inquiry Agent activated.")
    
    # Use only medicines collection
    return handle_health_inquiry(user_query, ['medicines'])

def handle_mental_wellness(user_query: str, is_crisis: bool = False):
    """
    The Mental Wellness Agent. Provides empathetic support and crisis detection.
    """
    print("🧠 Agent: Mental Wellness Agent activated.")
    
    if is_crisis:
        print("  🚨 CRISIS DETECTED - Providing immediate helpline information")
        crisis_response = (
            "I'm really concerned about what you're sharing. Your safety is the top priority.\n\n"
            "🆘 **Please reach out for immediate help:**\n"
            "- National Suicide Prevention Lifeline: **988** (US)\n"
            "- Crisis Text Line: Text **HOME** to **741741**\n"
            "- International Crisis Lines: https://www.iasp.info/resources/Crisis_Centres/\n\n"
            "You don't have to face this alone. Please talk to someone right now."
        )
        return {
            "agent": "Mental Wellness Agent",
            "response_type": "crisis_intervention",
            "answer": crisis_response,
            "crisis_detected": True,
            "sources": []
        }
    
    # Retrieve context from mental health collection
    retrieval = retrieve_context_from_collections(user_query, ['mental_health'], n_results=3)
    context = retrieval['context']
    
    prompt = (
        "You are Clinico, an empathetic mental wellness AI assistant. "
        "Provide compassionate, supportive responses based on the mental health context provided. "
        "Be warm, understanding, and encourage professional help when appropriate. "
        "If you detect any signs of crisis, urge the person to seek immediate help.\n\n"
        f"--- MENTAL HEALTH CONTEXT ---\n{context}\n\n"
        f"--- USER MESSAGE ---\n{user_query}\n\n"
        "--- EMPATHETIC RESPONSE ---\n"
    )
    
    try:
        final_answer = get_final_answer(prompt)

    except Exception as e:
        print(f"  ⚠️  Error generating response: {e}")
        final_answer = "I'm here to listen and support you. Would you like to tell me more about how you're feeling?"
    
    return {
        "agent": "Mental Wellness Agent",
        "response_type": "empathetic_support",
        "answer": final_answer,
        "crisis_detected": False,
        "sources": [
            {
                "source": r['metadata'].get('source', 'N/A'),
                "collection": r['collection'],
                "relevance": round(r['relevance'], 3)
            }
            for r in retrieval['results'][:3]
        ]
    }

def analyze_image_with_vision_model(image_base64: str, query: str) -> str:
    """
    Analyze an image using Ollama's vision model.
    Returns description and analysis of the image.
    """
    print("🖼️  Analyzing image with vision model...")
    
    try:
        # Ollama API expects images in base64 format
        response = requests.post(
            f"{OLLAMA_API_URL}/api/chat",
            json={
                "model": VISION_MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": f"Analyze this medical image and answer: {query}\n\nProvide a detailed medical analysis focusing on any visible symptoms, conditions, or abnormalities.",
                        "images": [image_base64]
                    }
                ],
                "stream": False
            }
        )
        response.raise_for_status()
        
        # Extract the message content from the response
        response_data = response.json()
        analysis = response_data['message']['content']
        
        print(f"✓ Image analysis complete")
        return analysis
        
    except requests.exceptions.HTTPError as e:
        print(f"⚠️  HTTP Error analyzing image: {e}")
        print(f"   Response: {e.response.text if e.response else 'No response'}")
        return "Unable to analyze the image at this time. Please try again or provide a text description."
    except KeyError as e:
        print(f"⚠️  Error parsing Ollama response: {e}")
        print(f"   Response data: {response.json() if response else 'No response'}")
        return "Unable to analyze the image - unexpected response format."
    except Exception as e:
        print(f"⚠️  Error analyzing image: {e}")
        return "Unable to analyze the image at this time. Please try again or provide a text description."

def process_image_input(image_data: str) -> dict:
    """
    Process base64 encoded image data.
    Returns dict with image info and base64 data.
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode and validate image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        return {
            "valid": True,
            "base64": image_data,
            "format": image.format,
            "size": image.size,
            "mode": image.mode
        }
    except Exception as e:
        print(f"⚠️  Error processing image: {e}")
        return {"valid": False, "error": str(e)}

def determine_intent(user_query: str, has_image: bool = False) -> dict:
    """
    Enhanced intent determination that considers image input.
    """
    print(f"🎯 Orchestrator: Determining intent for query: '{user_query}' (Image: {has_image})")
    
    # Check for crisis keywords first
    if any(keyword in user_query.lower() for keyword in CRISIS_KEYWORDS):
        return {
            "intent": "mental_wellness_distress",
            "collections": ["mental_health"],
            "is_crisis": True,
            "needs_appointment": False,
            "requires_vision": False
        }
    
    # Check for emergency
    emergency = detect_emergency_situation(user_query)
    if emergency["is_emergency"]:
        return {
            "intent": "care_coordination",
            "collections": [],
            "is_crisis": True,
            "needs_appointment": True,
            "emergency_type": emergency["type"],
            "requires_vision": False
        }
    
    # If image is present, likely a visual diagnosis query
    if has_image:
        image_keywords_medicine = ["prescription", "medicine","medicines","drug","drugs","pill", "tablet", "capsule", "dosage", "bottle", "label",
    "ointment", "cream", "ingredients", "vial", "blister pack",
    "brand", "generic", "instructions", "pharma"]
        image_keywords_disease = ["skin", "rash", "report", "scan", "x-ray", "mri", 
                         "test result", "symptom", "wound", "injury", "condition","mole", "spot", "spots", "swelling", "swollen", "redness",
    "bite", "sting", "bruise", "blister", "lump", "growth",
    "cut", "scrape", "burn", "discolored", "discoloration",
    "eye", "throat", "nail", "tongue", "lesion",
    "ultrasound", "lab results", "blood test", "biopsy"]
        query_lower = user_query.lower()
        medicine_collection_flag = False
        disease_collection_flag = False
        if any(keyword in query_lower for keyword in image_keywords_medicine):
            medicine_collection_flag = True

        if any(keyword in query_lower for keyword in image_keywords_disease):
            disease_collection_flag = True
        
        if medicine_collection_flag and disease_collection_flag:
            return {
                    "intent": "health_inquiry_with_image",
                    "collections": ["disease_symptoms", "medicines"],
                    "is_crisis": False,
                    "needs_appointment": True,  
                    "requires_vision": True
                }
        elif medicine_collection_flag:
            return {
                    "intent": "health_inquiry_with_image",
                    "collections": ["medicines"],
                    "is_crisis": False,
                    "needs_appointment": True, 
                    "requires_vision": True
                }
        else:
            return {
                    "intent": "health_inquiry_with_image",
                    "collections": ["disease_symptoms"],
                    "is_crisis": False,
                    "needs_appointment": True, 
                    "requires_vision": True
                }
    
    # Standard intent classification
    system_prompt = (
        "You are an AI orchestrator for a healthcare system. Analyze the user's query and respond with a JSON object containing:\n"
        "1. 'intent': one of ['health_inquiry', 'medicine_inquiry', 'mental_wellness', 'care_coordination', 'unclear']\n"
        "2. 'collections': list of relevant knowledge bases from ['disease_symptoms', 'mental_health', 'medicines']\n"
        "3. 'needs_appointment': boolean - true if user wants/needs to book an appointment or see a doctor\n"
        "4. 'requires_vision': boolean - true if query is about visual diagnosis (skin conditions, medical images, prescriptions)\n\n"
        "Intent definitions:\n"
        "- 'health_inquiry': Questions about diseases, symptoms, medical conditions, or general health\n"
        "- 'medicine_inquiry': Questions about medications, drugs, side effects, substitutes, or dosage\n"
        "- 'mental_wellness': Mental health concerns, stress, anxiety, depression, or emotional support\n"
        "- 'care_coordination': Finding doctors, booking appointments, scheduling, or wants to see a doctor\n"
        "- 'unclear': Ambiguous or unrelated queries\n\n"
        f"Note: User {'HAS' if has_image else 'DOES NOT have'} an image attached.\n\n"
        "Respond with only the JSON object, no other text."
    )
    
    try:
        content = call_model(system_prompt, user_query)

        
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            intent = result.get('intent', 'unclear')
            requested_collections = result.get('collections', [])
            needs_appointment = result.get('needs_appointment', False)
            requires_vision = result.get('requires_vision', False) or has_image
        else:
            intent = 'unclear'
            requested_collections = []
            needs_appointment = False
            requires_vision = has_image
        
        valid_collections = [col for col in requested_collections if col in collections]
        
        if not valid_collections and intent != 'care_coordination':
            if 'medicine' in user_query.lower() or 'drug' in user_query.lower():
                valid_collections = ['medicines']
            elif any(word in user_query.lower() for word in ['sad', 'anxious', 'depressed', 'stress']):
                valid_collections = ['mental_health']
            else:
                valid_collections = list(collections.keys())[:2]
        
        print(f"  -> Intent: '{intent}', Collections: {valid_collections}, Vision: {requires_vision}")
        
        return {
            "intent": intent,
            "collections": valid_collections,
            "is_crisis": False,
            "needs_appointment": needs_appointment,
            "requires_vision": requires_vision
        }
        
    except Exception as e:
        print(f"  -> Error during intent classification: {e}")
        return {
            "intent": "unclear",
            "collections": list(collections.keys())[:2],
            "is_crisis": False,
            "needs_appointment": False,
            "requires_vision": has_image
        }

def handle_image_based_inquiry(user_query: str, image_base64: str, collection_names: list):
    """
    Handle health inquiries that include image analysis.
    Combines vision analysis with RAG knowledge base.
    """
    print("🖼️  Agent: Image-Based Health Inquiry Agent activated.")
    
    # Step 1: Analyze the image using vision model
    image_analysis = analyze_image_with_vision_model(image_base64, user_query)
    
    # Step 2: Use image analysis to enhance the query for RAG
    enhanced_query = f"{user_query}\n\nBased on visual analysis: {image_analysis}"
    
    # Step 3: Retrieve context from knowledge base
    retrieval = retrieve_context_from_collections(enhanced_query, collection_names, n_results=3)
    context = retrieval['context']
    
    # Step 4: Generate comprehensive response
    prompt = (
        "You are Clinico, a medical AI assistant analyzing a medical image.\n\n"
        "IMAGE ANALYSIS:\n"
        f"{image_analysis}\n\n"
        "KNOWLEDGE BASE CONTEXT:\n"
        f"{context}\n\n"
        "USER QUESTION:\n"
        f"{user_query}\n\n"
        "Provide a clear, helpful response that:\n"
        "1. Describes what you observe in the image\n"
        "2. Explains potential conditions or concerns\n"
        "3. Provides relevant medical context from the knowledge base\n"
        "4. Recommends next steps (e.g., seeing a doctor)\n\n"
        "IMPORTANT: Always recommend professional medical consultation for visual symptoms.\n\n"
        "RESPONSE:"
    )
    
    try:
        get_final_answer(prompt)

    except Exception as e:
        print(f"  ⚠️  Error generating answer: {e}")
        final_answer = "I analyzed your image but encountered an error generating a complete response. Please consult a healthcare professional."
    
    return {
        "agent": "Image-Based Health Inquiry Agent",
        "response_type": "visual_diagnosis",
        "answer": final_answer,
        "image_analysis": image_analysis,
        "needs_appointment": True,
        "recommendation": "⚠️ Visual symptoms should be evaluated by a healthcare professional. Would you like to book an appointment?",
        "sources": [
            {
                "source": r['metadata'].get('source', 'N/A'),
                "collection": r['collection'],
                "relevance": round(r['relevance'], 3)
            }
            for r in retrieval['results'][:5]
        ],
        "options": [
            {"id": "book_appointment", "label": "📅 Book Appointment", "value": "book_appointment"},
            {"id": "more_info", "label": "ℹ️ More Information", "value": "more_info"}
        ]
    }
    """
    Detect if the user is in an emergency/crisis situation requiring immediate help.
    """
    # Emergency keywords
    emergency_keywords = [
        "emergency", "urgent", "critical", "heart attack", "chest pain", "severe pain",
        "bleeding heavily", "can't breathe", "difficulty breathing", "unconscious",
        "stroke", "seizure", "severe injury", "accident", "poisoning", "overdose"
    ]
    
    # Mental health crisis keywords
    mental_crisis_keywords = [
        "suicide", "kill myself", "end my life", "want to die", "self harm",
        "going to hurt myself", "no reason to live"
    ]
    
    query_lower = user_query.lower()
    
    # Check for medical emergency
    if any(keyword in query_lower for keyword in emergency_keywords):
        return {
            "is_emergency": True,
            "type": "medical",
            "severity": "critical"
        }
    
    # Check for mental health crisis
    if any(keyword in query_lower for keyword in mental_crisis_keywords):
        return {
            "is_emergency": True,
            "type": "mental_health",
            "severity": "critical"
        }
    
    return {
        "is_emergency": False,
        "type": None,
        "severity": "normal"
    }

def get_emergency_response(emergency_type: str) -> dict:
    """
    Provide immediate emergency helpline information.
    """
    if emergency_type == "medical":
        return {
            "agent": "Care Coordinator - Emergency Response",
            "response_type": "emergency_medical",
            "answer": (
                "🚨 **MEDICAL EMERGENCY DETECTED**\n\n"
                "Please call for immediate help:\n\n"
                "📞 **Emergency Services (India):**\n"
                "• Ambulance: **102** or **108**\n"
                "• All Emergency Services: **112**\n\n"
                "📱 **Clinico Emergency Helpline:**\n"
                "• **1800-XXX-XXXX** (24/7 Support)\n\n"
                "⚕️ If this is a life-threatening emergency, please call 102/108 immediately or go to the nearest hospital emergency room.\n\n"
                "Would you like me to help you find the nearest hospital?"
            ),
            "emergency": True,
            "options": [
                {"id": "find_hospital", "label": "🏥 Find Nearest Hospital", "value": "find_nearest_hospital"},
                {"id": "continue_booking", "label": "📅 Continue with Appointment Booking", "value": "continue_booking"}
            ],
            "sources": []
        }
    
    elif emergency_type == "mental_health":
        return {
            "agent": "Care Coordinator - Mental Health Crisis",
            "response_type": "emergency_mental_health",
            "answer": (
                "🆘 **MENTAL HEALTH CRISIS SUPPORT**\n\n"
                "Your safety is our top priority. Please reach out for immediate help:\n\n"
                "📞 **Crisis Helplines (India):**\n"
                "• KIRAN Mental Health Helpline: **1800-599-0019** (24/7)\n"
                "• Vandrevala Foundation: **1860-2662-345**\n"
                "• iCall Psychosocial Helpline: **022-25521111**\n\n"
                "📱 **Clinico Mental Health Crisis Line:**\n"
                "• **1800-XXX-YYYY** (24/7 Support)\n\n"
                "💚 You are not alone. Professional help is available right now.\n\n"
                "Would you like to:\n"
                "1. Connect with a crisis counselor immediately\n"
                "2. Book an urgent appointment with a psychiatrist"
            ),
            "emergency": True,
            "crisis": True,
            "options": [
                {"id": "crisis_counselor", "label": "🆘 Connect with Crisis Counselor", "value": "crisis_counselor"},
                {"id": "urgent_psychiatrist", "label": "👨‍⚕️ Urgent Psychiatrist Appointment", "value": "urgent_psychiatrist"}
            ],
            "sources": []
        }

def extract_specialization_from_query(user_query: str) -> str:
    """
    Extract or predict medical specialization from user query using LLM.
    """
    prompt = (
        "Extract the medical specialization from this query. Choose from this list:\n"
        "General Physician, Cardiologist, Dermatologist, Psychiatrist, Psychologist, "
        "Orthopedic, Gynecologist, Pediatrician, ENT Specialist, Ophthalmologist, "
        "Dentist, Neurologist, Gastroenterologist, Pulmonologist, Urologist, Oncologist, "
        "Physiotherapist, Nutritionist, Endocrinologist, Nephrologist\n\n"
        "If the query doesn't clearly indicate a specialty, respond with 'General Physician'.\n"
        "Respond with only the specialization name.\n\n"
        f"Query: {user_query}"
    )
    
    return get_specialization(prompt)

def handle_care_coordination(user_query: str, conversation_state: dict = None):
    """
    The Care Coordinator Agent with multi-step workflow.
    Fetches real doctors from Node.js API.
    """
    print("📅 Agent: Care Coordinator Agent activated.")
    
    # Initialize conversation state if not provided
    if conversation_state is None:
        conversation_state = {"step": "initial"}
    
    current_step = conversation_state.get("step", "initial")
    
    # Check for emergency situation first
    emergency = detect_emergency_situation(user_query)
    if emergency["is_emergency"]:
        return get_emergency_response(emergency["type"])
    
    # STEP 1: Initial - Ask for appointment type
    if current_step == "initial":
        return {
            "agent": "Care Coordinator Agent",
            "response_type": "appointment_type_selection",
            "answer": (
                "👋 Hello! I'm here to help you book a medical appointment.\n\n"
                "How would you like to consult with a doctor?"
            ),
            "conversation_state": {"step": "select_type"},
            "options": [
                {"id": "in_person", "label": "🏥 In-Person Visit", "value": "in_person"},
                {"id": "virtual", "label": "💻 Virtual Consultation", "value": "virtual"}
            ],
            "sources": []
        }
    
    # STEP 2: Get specialization based on selected type
    elif current_step == "select_type":
        appointment_type = user_query.lower()
        
        # Extract or predict specialization
        predicted_specialization = extract_specialization_from_query(user_query)
        
        if "in" in appointment_type and "person" in appointment_type:
            selected_type = "in_person"
            type_label = "in-person"
        elif "virtual" in appointment_type or "online" in appointment_type or "telehealth" in appointment_type:
            selected_type = "virtual"
            type_label = "virtual"
        else:
            selected_type = "virtual"  # default to virtual
            type_label = "virtual"
        
        return {
            "agent": "Care Coordinator Agent",
            "response_type": "specialization_selection",
            "answer": (
                f"Great! You've selected a **{type_label} consultation**.\n\n"
                f"Based on your query, I think you might need: **{predicted_specialization}**\n\n"
                "Is this correct, or would you like to choose a different specialty?"
            ),
            "conversation_state": {
                "step": "confirm_specialization",
                "appointment_type": selected_type,
                "predicted_specialization": predicted_specialization
            },
            "options": [
                {"id": "confirm_specialty", "label": f"✅ Yes, {predicted_specialization}", "value": f"confirm_{predicted_specialization}"},
                {"id": "choose_different", "label": "🔄 Choose Different Specialty", "value": "choose_different"}
            ],
            "sources": []
        }
    
    # STEP 3: Show all specializations if user wants to choose different
    elif current_step == "confirm_specialization":
        if "different" in user_query.lower() or "choose" in user_query.lower():
            specializations = [
                "General Physician", "Cardiologist", "Dermatologist", "Psychiatrist", 
                "Psychologist", "Orthopedic", "Gynecologist", "Pediatrician",
                "ENT Specialist", "Ophthalmologist", "Dentist", "Neurologist"
            ]
            
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "specialization_list",
                "answer": "Please select the medical specialty you need:",
                "conversation_state": {
                    "step": "specialization_selected",
                    "appointment_type": conversation_state.get("appointment_type", "virtual")
                },
                "options": [
                    {"id": f"spec_{i}", "label": spec, "value": spec}
                    for i, spec in enumerate(specializations)
                ],
                "sources": []
            }
        else:
            # User confirmed the predicted specialization
            specialization = conversation_state.get("predicted_specialization", "General Physician")
            conversation_state["specialization"] = specialization
            conversation_state["step"] = "specialization_selected"
    
    # STEP 4: Fetch real professionals from API
    if current_step == "specialization_selected" or (current_step == "confirm_specialization" and "confirm" in user_query.lower()):
        appointment_type = conversation_state.get("appointment_type", "virtual")
        specialization = conversation_state.get("specialization") or extract_specialization_from_query(user_query)
        
        if appointment_type == "virtual":
            # Fetch real professionals from API
            professionals = fetch_professionals_from_api(specialty=specialization)
            
            if not professionals:
                return {
                    "agent": "Care Coordinator Agent",
                    "response_type": "no_professionals_available",
                    "answer": (
                        f"I apologize, but I couldn't find any verified {specialization}s available for virtual consultation at the moment.\n\n"
                        "Would you like to:\n"
                        "1. Try a different specialty\n"
                        "2. Search for in-person doctors instead\n"
                        "3. Check back later"
                    ),
                    "conversation_state": {
                        "step": "select_type",
                        "specialization": specialization
                    },
                    "options": [
                        {"id": "different_specialty", "label": "🔄 Different Specialty", "value": "choose_different"},
                        {"id": "in_person", "label": "🏥 In-Person Instead", "value": "in_person"},
                        {"id": "later", "label": "⏰ Check Later", "value": "check_later"}
                    ],
                    "sources": []
                }
            
            # Format professionals for display
            suggestions = []
            for prof in professionals[:5]:  # Show max 5 professionals
                # Fetch availability for each professional
                slots = fetch_professional_availability(prof['professional_id'])
                availability_text = format_availability_text(slots)
                
                suggestions.append({
                    "professional_id": prof['professional_id'],
                    "name": f"Dr. {prof['full_name']}",
                    "specialty": prof['specialty'],
                    "credentials": prof.get('credentials', 'N/A'),
                    "experience": f"{prof.get('years_of_experience', 0)} years",
                    "availability": availability_text,
                    "available_slots": slots[:10],  # Keep first 10 slots
                    "is_volunteer": True  # All platform professionals are volunteer
                })
            
            suggestions_text = "\n".join([
                f"**{i+1}. {doc['name']}** ({doc['specialty']})\n"
                f"   📋 Experience: {doc['experience']}\n"
                f"   🕐 {doc['availability']}"
                + (" | 💚 Volunteer Doctor (Free)" if doc['is_volunteer'] else "")
                for i, doc in enumerate(suggestions)
            ])
            
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "doctor_suggestions",
                "answer": (
                    f"Here are verified {specialization}s available for virtual consultation:\n\n"
                    f"{suggestions_text}\n\n"
                    "Select a doctor to see their full availability and book an appointment:"
                ),
                "conversation_state": {
                    "step": "doctor_selected",
                    "appointment_type": appointment_type,
                    "specialization": specialization,
                    "suggestions": suggestions
                },
                "options": [
                    {"id": f"doc_{i}", "label": f"{doc['name']}", "value": f"doctor_{i}"}
                    for i, doc in enumerate(suggestions)
                ] + [
                    {"id": "different_specialty", "label": "🔄 Different Specialty", "value": "choose_different"}
                ],
                "sources": []
            }
        
        else:  # in_person
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "location_input",
                "answer": (
                    f"Perfect! Looking for a **{specialization}** for an in-person visit.\n\n"
                    "To find doctors near you, please:\n"
                    "• Use the 'Find a Clinic' map in the app\n"
                    "• Filter by specialty: {specialization}\n\n"
                    "The map will show nearby clinics with available doctors."
                ),
                "conversation_state": {
                    "step": "show_map",
                    "appointment_type": appointment_type,
                    "specialization": specialization
                },
                "options": [
                    {"id": "use_map", "label": "🗺️ Open Clinic Map", "value": "use_map"},
                    {"id": "virtual_instead", "label": "💻 Try Virtual Instead", "value": "virtual"}
                ],
                "sources": []
            }
    
    # STEP 5: Show selected doctor's full availability
    elif current_step == "doctor_selected":
        # Extract doctor index from user query
        doctor_idx = 0
        if "doctor_" in user_query:
            try:
                doctor_idx = int(user_query.split("doctor_")[1])
            except:
                doctor_idx = 0
        
        suggestions = conversation_state.get("suggestions", [])
        
        if doctor_idx >= len(suggestions):
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "error",
                "answer": "Invalid doctor selection. Please choose from the list.",
                "conversation_state": conversation_state,
                "options": []
            }
        
        selected_doctor = suggestions[doctor_idx]
        available_slots = selected_doctor.get('available_slots', [])
        
        if not available_slots:
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "no_slots_available",
                "answer": (
                    f"**{selected_doctor['name']}** currently has no available time slots.\n\n"
                    "Would you like to:\n"
                    "1. Choose a different doctor\n"
                    "2. Check back later"
                ),
                "conversation_state": conversation_state,
                "options": [
                    {"id": "go_back", "label": "🔙 Choose Different Doctor", "value": "go_back"},
                    {"id": "check_later", "label": "⏰ Check Later", "value": "check_later"}
                ],
                "sources": []
            }
        
        # Format time slots for display
        from datetime import datetime
        slots_text = []
        for i, slot in enumerate(available_slots[:10], 1):
            try:
                start_time = datetime.fromisoformat(slot['start_time'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(slot['end_time'].replace('Z', '+00:00'))
                
                date_str = start_time.strftime('%B %d, %Y')
                time_str = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
                
                slots_text.append(f"{i}. {date_str} at {time_str}")
            except:
                continue
        
        return {
            "agent": "Care Coordinator Agent",
            "response_type": "slot_selection",
            "answer": (
                f"**{selected_doctor['name']}**\n"
                f"📋 {selected_doctor['specialty']} | Experience: {selected_doctor['experience']}\n"
                f"💚 Volunteer Doctor (Free Consultation)\n\n"
                f"**Available Time Slots:**\n" +
                "\n".join(slots_text[:10]) + "\n\n"
                "Please select a time slot to book your appointment:"
            ),
            "conversation_state": {
                "step": "confirm_booking",
                "appointment_type": conversation_state.get("appointment_type"),
                "doctor": selected_doctor,
                "available_slots": available_slots
            },
            "options": [
                {"id": f"slot_{i}", "label": f"Slot {i+1}", "value": f"slot_{slot['slot_id']}"}
                for i, slot in enumerate(available_slots[:10])
            ] + [
                {"id": "go_back", "label": "🔙 Choose Different Doctor", "value": "go_back"}
            ],
            "sources": []
        }
    
    # STEP 6: Confirm booking
    elif current_step == "confirm_booking":
        # Extract slot ID from user query
        slot_id = None
        if "slot_" in user_query:
            try:
                slot_id = int(user_query.split("slot_")[1])
            except:
                pass
        
        if not slot_id:
            return {
                "agent": "Care Coordinator Agent",
                "response_type": "error",
                "answer": "Invalid slot selection. Please choose a time slot.",
                "conversation_state": conversation_state,
                "options": []
            }
        
        doctor = conversation_state.get("doctor", {})
        
        return {
            "agent": "Care Coordinator Agent",
            "response_type": "booking_confirmation",
            "answer": (
                f"✅ **Appointment Booking Request Submitted!**\n\n"
                f"📋 **Details:**\n"
                f"   Doctor: {doctor.get('name', 'N/A')}\n"
                f"   Specialty: {doctor.get('specialty', 'N/A')}\n"
                f"   Type: Virtual Consultation\n"
                f"   Professional ID: {doctor.get('professional_id', 'N/A')}\n"
                f"   Slot ID: {slot_id}\n"
                f"   Status: Pending Confirmation\n\n"
                "🎉 **Free Volunteer Consultation!**\n\n"
                "You will receive a confirmation SMS/Email within 1 hour with:\n"
                "• Video consultation link\n"
                "• Final appointment time\n"
                "• Pre-consultation instructions\n\n"
                "📱 Track your appointment in the 'My Appointments' section."
            ),
            "conversation_state": {
                "step": "completed",
                "booking_data": {
                    "professional_id": doctor.get('professional_id'),
                    "slot_id": slot_id,
                    "appointment_type": "Virtual"
                }
            },
            "options": [
                {"id": "new_appointment", "label": "📅 Book Another", "value": "new_appointment"},
                {"id": "main_menu", "label": "🏠 Main Menu", "value": "main_menu"}
            ],
            "sources": []
        }
    
    # Default fallback
    return {
        "agent": "Care Coordinator Agent",
        "response_type": "guidance",
        "answer": "I'm here to help you book a medical appointment. Would you like to start?",
        "conversation_state": {"step": "initial"},
        "options": [
            {"id": "start_booking", "label": "📅 Yes, Book Appointment", "value": "start_booking"},
            {"id": "cancel", "label": "❌ No, Cancel", "value": "cancel"}
        ],
        "sources": []
    }

# --- Main API Endpoint: The AI Orchestrator ---
@app.route('/v1/agent/orchestrate', methods=['POST'])
@verify_user_token 
@rate_limit 
@monitor_request
def orchestrate_agent():
    """
    Main orchestration endpoint with image support.
    Accepts both text queries and images (base64 encoded).
    """
    if not embedding_model or not collections:
        return jsonify({"error": "Service is not initialized properly."}), 500

    user_id = request.user['user_id']
    user_email = request.user['email']
    user_role = request.user['role']

    data = request.json
    user_query = data.get('query')
    image_data = data.get('image', None)
    conversation_state = data.get('conversation_state', None)
    
    if not user_query:
        return jsonify({"error": "Query not provided"}), 400

    try:
        print(f"\n{'='*80}")
        print(f"👤 User: {user_email} (ID: {user_id}, Role: {user_role})")
        print(f"📨 Query: {user_query}")
        print(f"🖼️  Image: {'Yes' if image_data else 'No'}")
        if conversation_state:
            print(f"📊 State: {conversation_state.get('step', 'unknown')}")
        print(f"{'='*80}")
        
        # Log user message to database
        log_chat_to_database(user_id, user_query, 'User')
        
        # Process image if provided
        image_info = None
        if image_data:
            image_info = process_image_input(image_data)
            if not image_info['valid']:
                return jsonify({
                    "error": "Invalid image data",
                    "details": image_info.get('error', 'Unknown error')
                }), 400
            print(f"✓ Image validated: {image_info['format']} {image_info['size']}")
        
        # If we're in a care coordination flow, continue with that
        if conversation_state and conversation_state.get('step') != 'initial':
            print("↪️  Continuing Care Coordination flow...")
            response_data = handle_care_coordination(user_query, conversation_state)
        else:
            # 1. Analyze User Intent (with image awareness)
            intent_data = determine_intent(user_query, has_image=bool(image_data))
            intent = intent_data['intent']
            relevant_collections = intent_data['collections']
            is_crisis = intent_data['is_crisis']
            needs_appointment = intent_data.get('needs_appointment', False)
            requires_vision = intent_data.get('requires_vision', False)
            
            # 2. Handle emergency situations first
            if is_crisis and intent == "care_coordination":
                emergency_type = intent_data.get('emergency_type', 'medical')
                response_data = get_emergency_response(emergency_type)
            
            # 3. Handle image-based queries
            elif requires_vision and image_data:
                response_data = handle_image_based_inquiry(
                    user_query, 
                    image_info['base64'], 
                    relevant_collections
                )
            
            # 4. Handle query with image but no vision analysis needed
            elif image_data and not requires_vision:
                # Still analyze image but treat as regular health inquiry
                image_analysis = analyze_image_with_vision_model(image_info['base64'], user_query)
                enhanced_query = f"{user_query}\n\nImage context: {image_analysis}"
                response_data = handle_health_inquiry(enhanced_query, relevant_collections)
                response_data['image_analyzed'] = True
                response_data['image_context'] = image_analysis[:200] + "..."  # Brief preview
            
            # 5. If health query needs appointment, offer to book after answering
            elif intent == "health_inquiry" and needs_appointment:
                health_response = handle_health_inquiry(user_query, relevant_collections)
                health_response['needs_appointment'] = True
                health_response['answer'] += (
                    "\n\n---\n\n"
                    "Based on your symptoms/concern, I recommend consulting a doctor. "
                    "Would you like me to help you book an appointment?"
                )
                health_response['options'] = [
                    {"id": "book_appointment", "label": "Yes, Book Appointment", "value": "book_appointment"},
                    {"id": "no_thanks", "label": "No, Thanks", "value": "no_thanks"}
                ]
                response_data = health_response
            
            # 6. Route to appropriate agent based on intent
            elif intent == "health_inquiry" or intent == "health_inquiry_with_image":
                response_data = handle_health_inquiry(user_query, relevant_collections)
            
            elif intent == "medicine_inquiry":
                response_data = handle_medicine_inquiry(user_query)
            
            elif intent == "mental_wellness" or is_crisis:
                response_data = handle_mental_wellness(user_query, is_crisis)
            
            elif intent == "care_coordination" or needs_appointment:
                response_data = handle_care_coordination(user_query, None)
                
            else:  # Unclear intent
                print("Agent: Fallback - Asking clarifying questions.")
                response_data = {
                    "agent": "Orchestrator",
                    "response_type": "clarification",
                    "answer": (
                        "I'm not sure I understand what you're looking for. Could you please clarify?\n\n"
                        "I can help with:\n"
                        "- Health questions about diseases and symptoms\n"
                        "- Medicine information and recommendations\n"
                        "- Mental health and wellness support\n"
                        "- Finding doctors and booking appointments\n"
                        "- Analyzing medical images (skin conditions, prescriptions, test results)"
                    ),
                    "options": [
                        {"id": "health", "label": "Health Question", "value": "health_inquiry"},
                        {"id": "medicine", "label": "Medicine Info", "value": "medicine_inquiry"},
                        {"id": "mental", "label": "Mental Wellness", "value": "mental_wellness"},
                        {"id": "appointment", "label": "Book Appointment", "value": "care_coordination"},
                        {"id": "image", "label": "Analyze Image", "value": "image_analysis"}
                    ],
                    "sources": []
                }
        
        # Log AI response to database
        log_chat_to_database(user_id, response_data.get('answer', ''), 'AI')
        
        # Add metadata to response
        response_data['query'] = user_query
        response_data['has_image'] = bool(image_data)
        response_data['intent'] = intent_data.get('intent', 'unknown') if not conversation_state else 'care_coordination'
        response_data['collections_used'] = relevant_collections if not conversation_state else []
        response_data['user'] = {
            'user_id': user_id,
            'email': user_email,
            'role': user_role
        }
        
        print(f"\n✅ Response by: {response_data['agent']}")
        print(f"{'='*80}\n")

        if 'agent' in response_data:
            log_agent_usage(
                response_data['agent'],
                intent=response_data.get('intent')
            )
        
        if 'collections_used' in response_data:
            for collection in response_data['collections_used']:
                log_collection_query(collection)
        
        if is_crisis:
            log_crisis_detection(intent_data.get('emergency_type', 'unknown'))
        
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error during orchestration: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route('/v1/agent/analyze-image', methods=['POST'])
@verify_user_token 
@rate_limit
@monitor_request
def analyze_image_only():
    """
    Endpoint for image analysis without query context.
    Requires authentication.
    """
    if not embedding_model:
        return jsonify({"error": "Service is not initialized properly."}), 500

    user_id = request.user['user_id']
    
    data = request.json
    image_data = data.get('image')
    analysis_type = data.get('type', 'general')
    
    if not image_data:
        return jsonify({"error": "Image data not provided"}), 400

    try:
        print(f"\n{'='*80}")
        print(f"👤 User ID: {user_id}")
        print(f"🖼️  Image Analysis Request - Type: {analysis_type}")
        print(f"{'='*80}")
        
        image_info = process_image_input(image_data)
        if not image_info['valid']:
            return jsonify({
                "error": "Invalid image data",
                "details": image_info.get('error', 'Unknown error')
            }), 400
        
        prompts = {
            'general': "Analyze this medical image. Describe what you see and identify any potential health concerns.",
            'prescription': "Read and extract all information from this prescription image. List: medicine names, dosages, frequency, duration, and doctor's instructions.",
            'skin': "Analyze this skin condition image. Describe the appearance, potential conditions, and recommend whether medical consultation is needed.",
            'xray': "Analyze this X-ray/medical scan image. Describe any visible abnormalities or concerns that should be evaluated by a medical professional.",
            'lab_report': "Extract and summarize the key findings from this laboratory test report. Highlight any values outside normal ranges."
        }
        
        prompt = prompts.get(analysis_type, prompts['general'])

        image_start = time.time()
        analysis = analyze_image_with_vision_model(image_info['base64'], prompt)
        
        # Log image analysis
        log_image_processing(image_start)
        log_chat_to_database(user_id, f"[Image Analysis - {analysis_type}]", 'User')
        log_chat_to_database(user_id, analysis, 'AI')
        
        response_data = {
            "agent": "Image Analysis Agent",
            "response_type": "image_analysis",
            "analysis_type": analysis_type,
            "analysis": analysis,
            "image_info": {
                "format": image_info['format'],
                "size": image_info['size']
            },
            "recommendation": "For accurate diagnosis, please consult with a healthcare professional.",
            "user_id": user_id
        }
        
        print(f"✅ Image analysis complete")
        print(f"{'='*80}\n")
        
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error during image analysis: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An error occurred while analyzing the image."}), 500

@app.route('/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    status = {
        "status": "healthy",
        "timestamp": time.time(),
        "collections": list(collections.keys()) if collections else [],
        "text_model": GENERATOR_MODEL if not use_gemini else "gemini-2.5-flash-lite",
        "vision_model": VISION_MODEL,
        "capabilities": [
            "text_query",
            "image_analysis",
            "multi_turn_conversation"
        ],
        "rate_limiting": os.getenv("RATE_LIMIT_ENABLED", "true"),
        "monitoring": os.getenv("MONITORING_ENABLED", "true"),
        "using_gemini": str(use_gemini).lower(),      # "true" / "false"
        "local_llm_available": not use_gemini         # for clarity in frontend
    }

    return jsonify(status)

@app.route('/v1/collections', methods=['GET'])
def list_collections():
    """List all available collections and their counts."""
    return jsonify({
        "collections": {
            name: col.count()
            for name, col in collections.items()
        }
    })

@app.route('/v1/metrics', methods=['GET'])
def get_metrics():
    """
    Get application metrics and statistics.
    Public endpoint for monitoring dashboards.
    """
    if not metrics:
        return jsonify({"error": "Monitoring not enabled"}), 503
    
    try:
        return jsonify(metrics.get_metrics_summary())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/v1/metrics/errors', methods=['GET'])
def get_recent_errors():
    """
    Get recent error logs.
    """
    if not metrics:
        return jsonify({"error": "Monitoring not enabled"}), 503
    
    try:
        limit = int(request.args.get('limit', 20))
        errors = metrics.get_recent_errors(limit)
        
        return jsonify({
            "errors": errors,
            "count": len(errors)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/v1/health/detailed', methods=['GET'])
def detailed_health_check():
    """
    Comprehensive health check of all system components.
    """
    try:
        health_status = HealthCheck.check_all()
        
        # Add metrics if available
        # if metrics:
        #     summary = metrics.get_metrics_summary()
        #     health_status['metrics'] = {
        #         'total_requests': summary['requests']['total'],
        #         'error_rate': summary['errors']['error_rate'],
        #         'uptime_hours': round(summary['uptime_seconds'] / 3600, 2)
        #     }
        
        status_code = 200
        if health_status['status'] == 'unhealthy':
            status_code = 503
        elif health_status['status'] == 'degraded':
            status_code = 200  # Still functional
        
        return jsonify(health_status), status_code
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/v1/rate-limit/status', methods=['GET'])
@verify_user_token
def get_user_rate_limit_status():
    """
    Get rate limit status for the authenticated user.
    """
    try:
        user_id = request.user['user_id']
        role = request.user['role']
        
        status = get_rate_limit_status(user_id, role)
        
        return jsonify(status)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/v1/metrics/reset', methods=['POST'])
def reset_metrics():
    """
    Reset all metrics (admin only, use with caution).
    Requires special admin token.
    """
    admin_token = request.headers.get('X-Admin-Token')
    
    if admin_token != os.getenv('ADMIN_RESET_TOKEN'):
        return jsonify({"error": "Unauthorized"}), 403
    
    if metrics:
        metrics.reset_metrics()
        return jsonify({"message": "Metrics reset successfully"})
    
    return jsonify({"error": "Monitoring not enabled"}), 503

if __name__ == '__main__':
    print("\n" + "="*80)
    print("🚀 Clinico AI Service Started with Vision Support")
    print("="*80)
    print(f"Collections loaded: {list(collections.keys())}")
    print(f"Text Generator model: {GENERATOR_MODEL}")
    print(f"Gemini model: {GEMINI_MODEL}")
    print(f"Vision model: {VISION_MODEL}")
    print("="*80 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)