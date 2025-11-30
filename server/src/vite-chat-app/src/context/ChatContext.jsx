import React, { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext();

const initialState = {
  activeSession: null,
 sessions: [],
  messages: {},
  aiSessions: [],
 aiMessages: {},
  loading: false,
  error: null,
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_SESSION':
      return {
        ...state,
        activeSession: action.payload,
      };
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      };
    case 'SET_AI_SESSIONS':
      return {
        ...state,
        aiSessions: action.payload,
      };
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    case 'ADD_AI_SESSION':
      return {
        ...state,
        aiSessions: [...state.aiSessions, action.payload],
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.conversation_id !== action.payload),
        aiSessions: state.aiSessions.filter(session => session.session_id !== action.payload),
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: action.payload.messages,
        },
      };
    case 'SET_AI_MESSAGES':
      return {
        ...state,
        aiMessages: {
          ...state.aiMessages,
          [action.payload.sessionId]: action.payload.messages,
        },
      };
    case 'ADD_MESSAGE':
      const existingMessages = state.messages[action.payload.sessionId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: [...existingMessages, action.payload.message],
        },
      };
    case 'ADD_AI_MESSAGE':
      const existingAiMessages = state.aiMessages[action.payload.sessionId] || [];
      return {
        ...state,
        aiMessages: {
          ...state.aiMessages,
          [action.payload.sessionId]: [...existingAiMessages, action.payload.message],
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const value = {
    state,
    dispatch,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}