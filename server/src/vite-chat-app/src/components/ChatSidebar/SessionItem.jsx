import React from 'react';

const SessionItem = ({ session, onSelect, onDelete }) => {
  const handleSelect = () => {
    onSelect(session);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(session.id, session.type);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (type) => {
    if (type === 'ai') {
      return (
        <span style={{
          display: "inline-block",
          width: "24px",
          height: "24px",
          backgroundColor: "#6f42c1",
          borderRadius: "50%",
          textAlign: "center",
          lineHeight: "24px",
          color: "white",
          fontSize: "12px",
          marginRight: "8px"
        }}>
          🤖
        </span>
      );
    } else {
      return (
        <span style={{
          display: "inline-block",
          width: "24px",
          height: "24px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          textAlign: "center",
          lineHeight: "24px",
          color: "white",
          fontSize: "12px",
          marginRight: "8px"
        }}>
          👨‍⚕️
        </span>
      );
    }
 };

  return (
    <div 
      style={{ 
        padding: "15px",
        cursor: "pointer", 
        borderBottom: "1px solid #eee",
        transition: "background-color 0.2s",
        backgroundColor: session.isActive ? "#e3f2fd" : "#fff"
      }}
      onClick={handleSelect}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = session.isActive ? "#e3f2fd" : "#fff"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {getTypeIcon(session.type)}
          <div>
            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
              {session.title}
            </div>
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {session.lastMessage}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ fontSize: "0.7em", color: "#999", textAlign: "right" }}>
            {formatTime(session.lastMessageTime)}
          </div>
          <button
            onClick={handleDelete}
            style={{
              background: "none",
              border: "none",
              color: "#dc3545",
              cursor: "pointer",
              fontSize: "14px",
              padding: "2px 5px"
            }}
            title="Delete session"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionItem;