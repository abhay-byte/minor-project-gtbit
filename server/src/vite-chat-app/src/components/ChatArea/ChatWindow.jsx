import React, { useEffect, useState, useRef } from 'react';
import { fetchMessages, sendMessage } from '../../services/apiClient';
import { getMessages, setMessages } from '../../utils/localStorage';
import MessageItem from './MessageItem';
import axios from 'axios';
import { initiateVideoConsultationForPatient, initiateVideoConsultationForDoctor } from '../../services/appointmentService';

const ChatWindow = ({ token, conversationId, sessionType }) => {
  const [messages, setMessagesState] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to create a video room for an appointment
  const handleJoinVideoCall = async () => {
    try {
      // In the testing web app, we need to create an appointment first
      // Then use that appointment ID to create the video room
      // We'll need to get patient and doctor IDs from the user context
      
      // Use the token passed as a prop from parent component
      if (!token) {
        alert('Please log in first');
        return;
      }

      // We need to identify if the current user is a patient or doctor
      // and get the corresponding IDs to create an appointment
      // For this demo, we'll simulate the process
      
      // Let's try to get the current user's info from the token
      // First decode the token to get user info (simplified)
      // Extract payload from JWT token (format: header.payload.signature)
      const tokenParts = token?.split('.');
      const tokenPayload = tokenParts?.length === 3 ? tokenParts[1] : null;
      let userId, userRole;
      
      if (tokenPayload) {
        try {
          const decodedPayload = atob(tokenPayload); // Decode base64
          const decoded = JSON.parse(decodedPayload);
          userId = decoded.user_id;
          userRole = decoded.role;
        } catch (e) {
          console.error('Could not decode token', e);
        }
      }
      
      // For a conversation, we need to determine the other party
      // In a real implementation, we'd get this from the conversation details
      // For now, we'll implement the logic differently based on user role
      
      let patientId, doctorId;
      
      if (userRole === 'Patient') {
        patientId = userId;
        // For demo purposes, we'll use a default doctor ID
        // In real implementation, this would come from the conversation
        // Use doctor's professional ID (we know Dr. Amit Patel has ID 10)
        doctorId = 10; // Using Dr. Amit Patel's ID (as we know from the profile)
        
        // For patients, create a new appointment and video room
        const result = await initiateVideoConsultationForPatient(patientId, doctorId, token);
        const { roomId } = result;
        
        // Navigate to the video room
        window.location.href = `/room/${roomId}`;
      } else if (userRole === 'Professional') {
        doctorId = userId;
        
        // For doctors, join an existing appointment
        const result = await initiateVideoConsultationForDoctor(doctorId, token);
        const { roomId } = result;
        
        // Navigate to the video room
        window.location.href = `/room/${roomId}`;
      } else {
        alert('Only patients and professionals can start video calls');
        return;
      }
    } catch (error) {
      console.error('Failed to start video consultation:', error);
      alert('Failed to start video call: ' + (error.response?.data?.message || error.message));
    }
   };

  useEffect(() => {
    if (conversationId && sessionType === 'doctor') {
      loadMessages();
    } else {
      setMessagesState([]);
    }
  }, [conversationId, sessionType, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, try to load from localStorage
      let localMessages = getMessages(conversationId);
      setMessagesState(localMessages);
      
      // Then fetch from API to get the latest
      const response = await fetchMessages(conversationId, token);
      
      if (response.success) {
        const apiMessages = response.data || [];
        setMessagesState(apiMessages);
        // Update localStorage with the latest messages
        setMessages(conversationId, apiMessages);
      } else {
        setMessagesState([]);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
      // If API fails, try to load from localStorage as fallback
      if (conversationId) {
        setMessagesState(getMessages(conversationId));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    
    try {
      setLoading(true);
      await sendMessage(conversationId, token, input);
      setInput("");
      // Refresh messages after sending
      loadMessages();
    } catch (error) {
      setError('Failed to send message');
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (sessionType === 'ai') {
    // For AI sessions, we'll handle this in the AIChatInterface component
    return null;
  }

  if (error) {
    return (
      <div style={{
        flex: 1,
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff5f5"
      }}>
        <div style={{ textAlign: "center", color: "#dc3545" }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button
            onClick={loadMessages}
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

  if (!conversationId) {
    return (
      <div style={{
        flex: 1,
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{ textAlign: "center" }}>
          <h3>💬 Select a conversation</h3>
          <p>Please select a conversation from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderLeft: "1px solid #ddd",
      minHeight: 0  /* This allows the flex item to shrink below its content size */
    }}>
      {/* Header with video call button */}
      <div style={{
        padding: "10px 15px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f8f9fa",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <h3>Chat</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {sessionType === 'doctor' && (
            <button
              onClick={handleJoinVideoCall}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <span>🎥</span>
              Start Video Call
            </button>
          )}
        </div>
      </div>
      
      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        marginTop: "60px" /* Make space for the header */
      }}>
        {loading && messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#66",
            paddingTop: "50px"
          }}>
            Loading messages...
          </div>
        ) : messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageItem
              key={message.message_id || index}
              message={message}
            />
          ))
        ) : (
          <div style={{
            textAlign: "center",
            color: "#66",
            paddingTop: "50px"
          }}>
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: "15px",
        borderTop: "1px solid #ddd",
        backgroundColor: "white"
      }}>
        <form onSubmit={handleSend} style={{ display: "flex", gap: "10px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              padding: "12px 20px",
              backgroundColor: input.trim() && !loading ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: "14px"
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;