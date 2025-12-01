# Clinico AI-Enhanced Chat Application

This is an updated version of the doctor-patient chat application with integrated AI assistant functionality for patients. The application allows users to have conversations with both doctors and an AI health assistant.

## Features

- **Dual Chat Interface**: Switch between doctor conversations and AI assistant chats
- **Session Management**: Create, switch between, delete, and rename chat sessions
- **AI Health Assistant**: Get health-related information and guidance from an AI assistant
- **Persistent Chat History**: Messages are saved both in the backend and in local storage
- **Visual Distinction**: Clear UI differentiation between doctor chats and AI assistant chats
- **User Management**: Switch between patient and doctor roles

## Architecture

The application is built with React and Vite, featuring:

- **Context API**: For state management across the application
- **Local Storage**: For client-side message persistence
- **API Integration**: Connects to the Clinico backend for doctor conversations and AI services
- **Responsive Design**: Works across desktop, tablet, and mobile devices

## Components

### Core Components
- `App.jsx`: Main application component with user management and session switching
- `ChatContext.jsx`: State management for active sessions and messages
- `apiClient.js`: API service for both doctor and AI chat endpoints

### Chat Interface Components
- `ChatWindow.jsx`: Handles doctor-patient conversations
- `AIChatInterface.jsx`: Dedicated interface for AI assistant interactions
- `MessageItem.jsx`: Displays individual messages with sender distinction
- `SessionList.jsx`: Sidebar showing all chat sessions
- `SessionItem.jsx`: Individual session item with type indicators

### Utility Components
- `localStorage.js`: Local storage management for chat history persistence

## API Endpoints Used

### Doctor Chat Endpoints
- `GET /api/conversations` - Fetch user's conversations
- `GET /api/conversations/:id/messages` - Fetch messages for a conversation
- `POST /api/conversations/:id/messages` - Send a new message

### AI Chat Endpoints
- `GET /api/ai/sessions` - Fetch AI chat sessions
- `GET /api/ai/sessions/:session_id/messages` - Fetch AI conversation messages
- `POST /api/ai/chat` - Send query to AI assistant
- `DELETE /api/ai/sessions/:session_id` - Delete an AI session

## UI/UX Features

- **Color Coding**: 
  - Doctor messages: Blue theme
  - AI assistant messages: Purple theme
  - Patient messages: Dark blue theme
- **Visual Indicators**: 
 - 🤖 for AI assistant sessions
  - 👨‍⚕️ for doctor sessions
- **Session Organization**: Separate sections for doctor and AI conversations
- **Loading States**: Clear indicators during API calls
- **Error Handling**: User-friendly error messages with retry options

## Setup Instructions

1. Ensure the Clinico backend server is running
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:5173`

## Usage

1. The application auto-logs in as a patient user
2. Use the "Switch User" button to toggle between patient and doctor roles
3. Select a conversation from the sidebar or create a new AI session
4. For AI assistant, type health-related questions in the input field
5. For doctor conversations, use the standard messaging interface

## Security Considerations

- All API calls require JWT authentication tokens
- Patient data is protected through proper authentication
- AI conversations are stored securely in the backend
- Local storage is used only for temporary message caching

## Notes

- AI assistant provides health information only and should not replace professional medical advice
- For medical emergencies, contact a healthcare professional
- All conversations are stored and may be accessed later
- The application uses pre-seeded user tokens for development purposes