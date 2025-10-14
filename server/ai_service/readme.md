🤖 Clinico AI ServiceThis service is a lightweight Python Flask application responsible for handling all interactions with generative AI models, starting with Google's Gemini Pro. It acts as a secure microservice that the main Node.js backend can communicate with.⚙️ RequirementsPython 3.8 or higherpip for package management▶️ Getting Started1. Configure Your EnvironmentThis service requires its own .env file for secret credentials.Create the .env file: In your terminal, navigate to the /server/ai_service directory and copy the example file:For Windows (Command Prompt/PowerShell):copy .env.example .env
For Linux / macOS:cp .env.example .env
Edit the .env file: Open the newly created ai_service/.env file and fill in your unique credentials:AI_SERVICE_API_KEY: Create a long, random, secret string. This will be used to secure the communication between your Node.js server and this Python service.GOOGLE_API_KEY: Your API key for the Google Gemini Pro model.2. Install DependenciesIt is highly recommended to use a Python virtual environment to keep dependencies isolated.# Navigate into the service directory
cd ai_service

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# Install the required packages
pip install -r requirements.txt
3. Run the ServiceOnce your environment is configured and dependencies are installed, you can start the Flask server.python main.py
The AI service will start, by default, on http://localhost:5001.