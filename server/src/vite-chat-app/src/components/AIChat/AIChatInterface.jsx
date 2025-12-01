import React, { useState, useEffect, useRef } from 'react';
import { sendAIQuery, fetchAIMessages } from '../../services/apiClient';
import { getMessages, setMessages } from '../../utils/localStorage';
import MessageItem from '../ChatArea/MessageItem';

const AIChatInterface = ({ token, session, onMessagesUpdate, onUpdateSession }) => {
  const [input, setInput] = useState('');
 const [messages, setMessagesState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages when session changes
 useEffect(() => {
    if (session) {
      loadMessages();
    }
  }, [session, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (onMessagesUpdate && session?.id && !session.id.startsWith('ai-')) {
      onMessagesUpdate(session?.id, messages);
    }
  }, [messages, onMessagesUpdate, session?.id]);

  const loadMessages = async () => {
    // If this is a new session without an ID, just initialize with empty messages
    if (!session?.id) {
      setMessagesState([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, try to load from localStorage
      let localMessages = getMessages(session.id);
      setMessagesState(localMessages);
      
      // Then fetch from API to get the latest (only if it's an existing session with a real ID)
      if (session.id && !session.id.startsWith('ai-')) { // Only fetch from API if it's not a temporary session
        const response = await fetchAIMessages(session.id, token);
        
        if (Array.isArray(response)) {
          // Transform API response to match our message format
          const formattedMessages = response.map(msg => ({
            message_id: msg.timestamp || Date.now().toString(),
            sender_type: msg.role === 'user' || msg.role === 'Patient' || (msg.sender && msg.sender.toLowerCase() === 'patient') ? 'Patient' : 'AI Assistant',
            message_content: msg.message || msg.message_content || msg.answer,
            sent_at: msg.timestamp || new Date().toISOString(),
            sender: msg.role === 'user' || msg.role === 'Patient' || (msg.sender && msg.sender.toLowerCase() === 'patient') ? 'Patient' : 'AI',
            image_url: msg.image_url || msg.has_image || null
          }));
          
          setMessagesState(formattedMessages);
          // Update localStorage with the latest messages
          setMessages(session.id, formattedMessages);
        }
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading AI messages:', err);
      // If API fails, try to load from localStorage as fallback
      if (session?.id) {
        setMessagesState(getMessages(session.id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage = {
        message_id: `temp-${Date.now()}`,
        sender_type: 'Patient',
        message_content: input,
        sent_at: new Date().toISOString(),
        sender: 'Patient'
      };

      setMessagesState(prev => [...prev, userMessage]);

      // Send to AI service
      // If this is a temporary session (no real ID), don't pass session ID to create new session
      const sessionId = session?.id && !session.id.startsWith('ai-') ? session.id : null;
      const response = await sendAIQuery(input, token, sessionId);

      // Check if the response indicates an error
      if (!response || !response.reply || (response.reply && response.reply.includes("I encountered an issue"))) {
        throw new Error(response.reply || "Failed to get response from AI service");
      }

      // Update session ID if this is a new session
      if (response.session_id && (!session?.id || session.id.startsWith('ai-'))) {
        // Update the session in the parent component to use the real session ID
        // This would be handled by calling a prop function if provided
      }

      // Add AI response to messages
      const aiMessage = {
        message_id: response.timestamp || Date.now().toString(),
        sender_type: 'AI Assistant',
        message_content: response.reply || response.answer || response.message, // Handle all possible response fields
        sent_at: response.timestamp || new Date().toISOString(),
        sender: 'AI'
      };

      // If we got a new session ID, update the session
      if (response.session_id && (!session?.id || session.id.startsWith('ai-'))) {
        // Update the session in the parent component
        if (onUpdateSession) {
          onUpdateSession(response.session_id, [userMessage, aiMessage]);
        }
      }

      setMessagesState(prevMessages => {
        const updatedMessages = [...prevMessages, userMessage, aiMessage].filter(msg => !msg.message_id.startsWith('temp-'));
        // Save to localStorage with the correct session ID
        const actualSessionId = response.session_id || session.id;
        if (actualSessionId && !actualSessionId.startsWith('ai-')) {
          setMessages(actualSessionId, updatedMessages);
        }
        return updatedMessages;
      });

      setInput('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending AI query:', err);
      
      // Remove temporary message if failed
      setMessagesState(prev => prev.filter(msg => !msg.message_id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <div style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column",
      borderLeft: "1px solid #ddd"
    }}>
      {/* Messages Container */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "20px",
        backgroundColor: "#fafafa"
      }}>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageItem 
              key={message.message_id || index} 
              message={message} 
            />
          ))
        ) : (
          <div style={{ 
            textAlign: "center", 
            color: "#666", 
            paddingTop: "50px" 
          }}>
            <div style={{ 
              display: "inline-block", 
              width: "80px", 
              height: "80px", 
              backgroundColor: "#f3e5f5", 
              borderRadius: "50%", 
              marginBottom: "15px",
              border: "2px solid #e1bee7"
            }}>
              <span style={{ 
                color: "#6a1b9a", 
                fontSize: "32px", 
                lineHeight: "80px" 
              }}>🤖</span>
            </div>
            <h4 style={{ color: "#6f42c1" }}>AI Health Assistant</h4>
            <p>Ask me anything about your health concerns</p>
            <div style={{ 
              marginTop: "20px", 
              padding: "10px", 
              backgroundColor: "#f3e5f5", 
              borderRadius: "8px", 
              border: "1px solid #e1bee7",
              maxWidth: "400px",
              margin: "20px auto 0"
            }}>
              <p style={{ margin: "5px 0", fontSize: "0.9em" }}>
                <strong>ℹ️ Note:</strong> This AI assistant provides health information only. 
                For medical emergencies, please contact a healthcare professional.
              </p>
            </div>
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
            placeholder="Ask about your health concerns..."
            style={{ 
              flex: 1, 
              padding: "12px", 
              border: "1px solid #ddd", 
              borderRadius: "4px",
              fontSize: "14px"
            }}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{ 
              padding: "12px 20px", 
              backgroundColor: input.trim() && !isLoading ? "#6f42c1" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              fontSize: "14px"
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
        
        {isLoading && (
          <div style={{ 
            padding: "10px 20px", 
            fontSize: "12px", 
            color: "#66", 
            textAlign: "center" 
          }}>
            AI Assistant is thinking...
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatInterface;