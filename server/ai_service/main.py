# ai_service/main.py
import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY")
if not AI_SERVICE_API_KEY:
    raise ValueError("AI_SERVICE_API_KEY not found in environment variables.")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)

@app.before_request
def check_api_key():
    """Middleware to protect all endpoints with an API key."""
    api_key = request.headers.get("X-API-Key")
    if api_key != AI_SERVICE_API_KEY:
        return jsonify({"error": "Unauthorized: Invalid API Key"}), 401

# --- API Endpoints ---
@app.route('/generate', methods=['POST'])
def generate_text():
    """
    Receives a prompt and generates content using the Gemini Pro model.
    Expects JSON body: { "prompt": "Your text here..." }
    """
    if not request.json or 'prompt' not in request.json:
        return jsonify({"error": "Missing 'prompt' in request body"}), 400

    prompt = request.json['prompt']

    try:
        model = genai.GenerativeModel('gemini-pro')
        
        response = model.generate_content(prompt)

        return jsonify({"generated_text": response.text})

    except Exception as e:
        print(f"Error generating content: {e}")
        return jsonify({"error": "An error occurred while generating content."}), 500

if __name__ == '__main__':
    port = int(os.getenv("AI_SERVICE_PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
