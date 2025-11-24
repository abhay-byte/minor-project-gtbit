import { useEffect, useState } from "react";
import { fetchMessages, sendMessage } from "./api";

export default function ChatWindow({ token, conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId, token)
        .then(res => {
          if (res.success) {
            setMessages(res.data || []);
          }
        })
        .catch(err => console.error("Error fetching messages:", err));
    }
  }, [conversationId, token]);

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission if inside a form
    if (!input.trim() || !conversationId) return;
    
    try {
      await sendMessage(conversationId, token, input);
      setInput("");
      // Refresh messages after sending
      fetchMessages(conversationId, token)
        .then(res => {
          if (res.success) {
            setMessages(res.data || []);
          }
        });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
          messages.map(m => (
            <div 
              key={m.message_id} 
              style={{ 
                marginBottom: 15,
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <strong style={{ color: "#007bff" }}>{m.sender_type}:</strong>
                <span style={{ fontSize: "0.8em", color: "#666" }}>
                  {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>{m.message_content}</div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: "center", 
            color: "#666", 
            paddingTop: "50px" 
          }}>
            No messages yet. Start the conversation!
          </div>
        )}
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
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            style={{ 
              padding: "12px 20px", 
              backgroundColor: input.trim() ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: "14px"
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}