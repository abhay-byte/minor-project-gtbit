import { useEffect, useState } from "react";
import { fetchConversations } from "./api";

export default function Conversations({ token, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations(token)
      .then(res => {
        if (res.success) {
          setConversations(res.data || []);
        }
      })
      .catch(err => console.error("Error fetching conversations:", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ 
        width: "30%", 
        borderRight: "1px solid #ddd", 
        padding: "20px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Loading conversations...</div>
      </div>
    );
  }

  return (
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
      
      <div style={{ flex: 1, overflowY: "auto" }}>
        {conversations.length > 0 ? (
          conversations.map(c => (
            <div 
              key={c.conversation_id}
              style={{ 
                padding: "15px",
                cursor: "pointer", 
                borderBottom: "1px solid #eee",
                transition: "background-color 0.2s",
                backgroundColor: "#fff"
              }}
              onClick={() => {
                console.log("Selecting conversation:", c.conversation_id);
                onSelect(c.conversation_id);
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {c.other_user_name || "Unknown User"}
              </div>
              <div style={{ fontSize: "0.9em", color: "#666" }}>
                {c.conversation_type || "General"}
              </div>
              <div style={{ fontSize: "0.8em", color: "#999", marginTop: "5px" }}>
                {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "No messages"}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            padding: "20px", 
            textAlign: "center", 
            color: "#666" 
          }}>
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}