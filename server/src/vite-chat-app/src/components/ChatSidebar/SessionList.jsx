import React, { useState, useEffect } from 'react';
import SessionItem from './SessionItem';
import { fetchConversations, fetchAISessions, deleteAISession } from '../../services/apiClient';

const SessionList = ({ token, onSelectSession, activeSession, user, onCreateNewAISession }) => {
  const [sessions, setSessions] = useState([]);
  const [aiSessions, setAISessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
 }, [token]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both doctor conversations and AI sessions
      const [doctorConversations, aiConversations] = await Promise.all([
        fetchConversations(token),
        fetchAISessions(token)
      ]);
      
      if (doctorConversations.success) {
        setSessions(doctorConversations.data || []);
      } else {
        setSessions([]);
      }
      
      if (Array.isArray(aiConversations)) {
        setAISessions(aiConversations);
      } else {
        setAISessions([]);
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, type) => {
    try {
      if (type === 'ai') {
        await deleteAISession(sessionId, token);
        setAISessions(aiSessions.filter(session => session.session_id !== sessionId));
      } else {
        // For doctor conversations, we'll just remove from the list
        // The actual deletion would be handled by the backend if needed
        setSessions(sessions.filter(session => session.conversation_id !== sessionId));
      }
      
      if (activeSession?.id === sessionId) {
        onSelectSession(null);
      }
    } catch (err) {
      setError('Failed to delete session');
      console.error('Error deleting session:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: "#dc3545"
      }}>
        {error}
        <div style={{ marginTop: "10px" }}>
          <button 
            onClick={loadSessions}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Doctor Conversations Section */}
      <div style={{ marginBottom: "20px", border: "1px solid #e9ecef", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "#f8f9fa",
          fontWeight: "bold",
          fontSize: "0.9em",
          color: "#495057",
          borderBottom: "1px solid #e9ecef"
        }}>
          <div>👨‍⚕️ Doctor Conversations</div>
        </div>
        {sessions.length > 0 ? (
          sessions.map(session => (
            <SessionItem
              key={session.conversation_id}
              session={{
                id: session.conversation_id,
                title: session.other_user_name || "Unknown User",
                lastMessage: session.conversation_type || "General",
                lastMessageTime: session.last_message_at,
                type: 'doctor',
                isActive: activeSession?.id === session.conversation_id && activeSession?.type === 'doctor'
              }}
              onSelect={onSelectSession}
              onDelete={handleDeleteSession}
            />
          ))
        ) : (
          <div style={{
            padding: "15px",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "0.9em"
          }}>
            No doctor conversations yet
          </div>
        )}
      </div>

      {/* AI Assistant Sessions Section */}
      <div style={{ border: "1px solid #e9ecef", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "#f8f0ff",
          fontWeight: "bold",
          fontSize: "0.9em",
          color: "#6f42c1",
          borderBottom: "1px solid #e9ecef"
        }}>
          <div>🤖 AI Assistant Sessions</div>
          <button 
            onClick={onCreateNewAISession}
            style={{
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.8em",
              cursor: "pointer"
            }}
          >
            New
          </button>
        </div>
        {aiSessions.length > 0 ? (
          aiSessions.map(session => (
            <SessionItem
              key={session.session_id}
              session={{
                id: session.session_id,
                title: session.session_summary || "AI Chat",
                lastMessage: session.session_type || "Health Query",
                lastMessageTime: session.last_updated,
                type: 'ai',
                isActive: activeSession?.id === session.session_id && activeSession?.type === 'ai'
              }}
              onSelect={onSelectSession}
              onDelete={handleDeleteSession}
            />
          ))
        ) : (
          <div style={{
            padding: "15px",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "0.9em"
          }}>
            No AI sessions yet
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList;