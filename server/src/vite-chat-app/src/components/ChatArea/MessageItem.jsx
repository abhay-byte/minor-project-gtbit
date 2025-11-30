import React from 'react';

const MessageItem = ({ message }) => {
  const isUser = message.sender_type === 'Patient' || message.sender === 'Patient';
  const isAI = message.sender_type === 'AI Assistant' || message.sender === 'AI';
  const isDoctor = message.sender_type === 'Doctor' || message.sender_type === 'Professional';

  // Determine message styling based on sender
  const getMessageStyle = () => {
    if (isUser) {
      return {
        backgroundColor: "#007bff",
        color: "white",
        marginLeft: "auto",
        marginRight: "10px",
        textAlign: "left",
        border: "1px solid #0069d9"
      };
    } else if (isAI) {
      return {
        backgroundColor: "#e2e2f9", // Light purple background
        color: "#4a148c",
        marginRight: "auto",
        marginLeft: "10px",
        textAlign: "left",
        border: "1px solid #b39ddb"
      };
    } else {
      return {
        backgroundColor: "#e9ecef",
        color: "#333",
        marginRight: "auto",
        marginLeft: "10px",
        textAlign: "left",
        border: "1px solid #dee2e6"
      };
    }
  };

  // Determine sender label
  const getSenderLabel = () => {
    if (isUser) {
      return "You";
    } else if (isAI) {
      return "🤖 AI Assistant";
    } else {
      return "👨‍⚕️ Doctor";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        marginBottom: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 5,
        marginLeft: isUser ? "10px" : "0",
        marginRight: isUser ? "0" : "10px"
      }}>
        {!isUser && (
          <span style={{
            fontSize: "0.8em",
            color: isAI ? "#6f42c1" : "#6c757d",
            fontWeight: "bold",
            marginRight: "8px"
          }}>
            {getSenderLabel()}
          </span>
        )}
        <span style={{ fontSize: "0.7em", color: "#666" }}>
          {formatTime(message.sent_at)}
        </span>
        {isUser && (
          <span style={{
            fontSize: "0.8em",
            color: "#007bff",
            fontWeight: "bold",
            marginLeft: "8px"
          }}>
            {getSenderLabel()}
          </span>
        )}
      </div>
      
      <div
        style={{
          padding: "12px",
          borderRadius: "18px",
          maxWidth: "70%",
          ...getMessageStyle(),
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
          {message.message_content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;