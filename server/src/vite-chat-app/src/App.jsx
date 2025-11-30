import { useState, useEffect } from "react";
import { ChatProvider, useChat } from "./context/ChatContext";
import Login from "./Login";
import SessionList from "./components/ChatSidebar/SessionList";
import ChatWindow from "./components/ChatArea/ChatWindow";
import AIChatInterface from "./components/AIChat/AIChatInterface";

function AppContent() {
  const { state, dispatch } = useChat();
  const [user, setUser] = useState(null);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  
  // Pre-seeded users
 const preSeededUsers = {
    patient: {
      role: "Patient",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWJoYXkucmFqQGV4YW1wbGUuY29tIiwicm9sZSI6IlBhdGllbnQiLCJ1c2VyX2lkX3V1aWQiOiIzNWVhMWMyZC0yMDg4LTRiZTUtOWRhOS1lZTY1MzNiNmU4ZjAiLCJpYXQiOjE3NjM5OTYzNTYsImV4cCI6MTc2NDA4Mjc1Nn0.96f-q2nGt7dX_eQWu_7kiJgqSx9bhE2v7vPUHdxUg08",
      user: {
        user_id: 1,
        email: "abhay.raj@example.com",
        full_name: "Abhay Raj",
        role: "Patient"
      }
    },
    doctor: {
      role: "Professional",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYW1pdC5wYXRlbEBleGFtcGxlLmNvbSIsInJvbGUiOiJQcm9mZXNzaW9uYWwiLCJ1c2VyX2lkX3V1aWQiOiIwNmQyMzEwNi1mM2FiLTQ3YzQtOThlNC00NTJhZWZjZmFjNTAiLCJpYXQiOjE3NjM5OTYzODMsImV4cCI6MTc2NDA4Mjc4M30.FyZPxKMbSd9Yu8EQoyjytVnRZK8qTSo2KZvj2afcyZk",
      user: {
        user_id: 4,
        email: "amit.patel@example.com",
        full_name: "Dr. Amit Patel",
        role: "Professional"
      }
    }
  };


  const switchUser = (userType) => {
    setUser(preSeededUsers[userType]);
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
    setShowUserSwitcher(false);
  };

  const handleSessionSelect = (session) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: session });
  };

  const handleCreateNewAISession = () => {
    // Create a temporary AI session object
    const newSession = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      title: 'New AI Chat',
      lastMessage: 'Health Query',
      lastMessageTime: new Date().toISOString(),
    };
    
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: newSession });
  };

  const handleUpdateSession = (sessionId, messages) => {
    // Update the session with the real ID from the API
    const updatedSession = {
      ...state.activeSession,
      id: sessionId,
    };
    
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: updatedSession });
  };

  if (!user) return <Login onLogin={setUser} />;

 return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      width: "100vw",
      overflow: "hidden"
    }}>
      {/* Header with user info and switcher */}
      <div style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <strong>Logged in as: {user.user.full_name} ({user.user.role})</strong>
          <div style={{ fontSize: "0.9em", opacity: 0.8 }}>{user.user.email}</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            style={{
              backgroundColor: "white",
              color: "#007bff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Switch User
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_SESSION', payload: null })}
            style={{
              backgroundColor: "white",
              color: "#007bff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Clear Selection
          </button>
        </div>
      </div>
      
      {/* User switcher dropdown */}
      {showUserSwitcher && (
        <div style={{
          backgroundColor: "#e9ecef",
          padding: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "20px"
        }}>
          <button
            onClick={() => switchUser('patient')}
            style={{
              backgroundColor: user?.user?.role === 'Patient' ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Switch to Patient
          </button>
          <button
            onClick={() => switchUser('doctor')}
            style={{
              backgroundColor: user?.user?.role === 'Professional' ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Switch to Doctor
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden"
      }}>
        <div style={{
          width: "30%",
          borderRight: "1px solid #ddd",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{
            padding: "15px",
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: "bold"
          }}>
            Your Conversations
          </div>
          
          <SessionList
            token={user.token}
            onSelectSession={handleSessionSelect}
            activeSession={state.activeSession}
            user={user}
            onCreateNewAISession={handleCreateNewAISession}
          />
        </div>
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {state.activeSession?.type === 'ai' ? (
            <AIChatInterface
              token={user.token}
              session={state.activeSession}
              onUpdateSession={handleUpdateSession}
            />
          ) : (
            <ChatWindow
              token={user.token}
              conversationId={state.activeSession?.id}
              sessionType={state.activeSession?.type || 'doctor'}
            />
          )}
        </div>
      </div>
    </div>
 );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}