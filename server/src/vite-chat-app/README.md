# Clinico Chat Application

This is a Vite + React application for testing the doctor-patient chat system with the Clinico backend API.

## Features

- Automatic login for pre-seeded Patient and Doctor accounts
- Conversation list view
- Real-time chat interface with message input and send button
- Message sending and receiving capabilities
- User switching between Patient and Doctor roles
- Runs on port 5173

## Setup Instructions

1. Navigate to the chat-app directory:
   ```bash
   cd server/src/vite-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:5173
   ```

## Usage

1. The application automatically logs in as the Patient user after 2 seconds
2. View your list of conversations in the left panel
3. Click on a conversation to open the chat window
4. Type your message in the input box at the bottom and press Enter or click "Send"
5. Use the "Switch User" button to toggle between Patient and Doctor accounts for testing both sides of conversations

## API Endpoints Used

- `GET /api/conversations` - Fetch conversation list
- `GET /api/conversations/{id}/messages` - Fetch messages for a conversation
- `POST /api/conversations/{id}/messages` - Send a new message

## Configuration

The application connects to the backend API at `http://localhost:5000` by default. You can modify this in `src/api.js` if your backend runs on a different port or address.