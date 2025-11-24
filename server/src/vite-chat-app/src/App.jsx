import { useState, useEffect } from "react";
import Login from "./Login";
import Conversations from "./Conversations";
import ChatWindow from "./ChatWindow";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
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

  // Auto-login patient user
  useEffect(() => {
    // Auto-login as patient after a short delay to show the login screen briefly
    const timer = setTimeout(() => {
      setUser(preSeededUsers.patient);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const switchUser = (userType) => {
    setUser(preSeededUsers[userType]);
    setActiveConversation(null);
    setShowUserSwitcher(false);
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
            onClick={() => setActiveConversation(null)}
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
        <Conversations 
          token={user.token} 
          onSelect={(conversationId) => {
            console.log("Selected conversation:", conversationId);
            setActiveConversation(conversationId);
          }} 
        />
        <ChatWindow 
          token={user.token} 
          conversationId={activeConversation} 
        />
      </div>
    </div>
  );
}