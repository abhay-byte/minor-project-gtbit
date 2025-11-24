import { useEffect } from "react";

// Pre-seeded user tokens from successful login
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

export default function Login({ onLogin }) {
  // Auto-login the patient user on component mount for testing
  useEffect(() => {
    console.log("Auto-logging in Patient user for testing...");
    
    // Auto-login as Patient after a brief delay to show the UI briefly
    setTimeout(() => {
      onLogin(preSeededUsers.patient);
      console.log("Patient logged in automatically with seeded credentials");
    }, 1500);
  }, [onLogin]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f8f9fa",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h1 style={{ color: "#007bff", marginBottom: "30px" }}>Clinico Chat</h1>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Pre-Loaded Users</h2>
        
        <div style={{ 
          backgroundColor: "#d4edda", 
          padding: "15px", 
          borderRadius: "4px", 
          marginBottom: "20px",
          border: "1px solid #c3e6cb"
        }}>
          <p style={{ margin: "5px 0", color: "#155724" }}>
            <strong>Patient:</strong> abhay.raj@example.com (Auto-logging in...)
          </p>
          <p style={{ margin: "5px 0", color: "#155724" }}>
            <strong>Doctor:</strong> amit.patel@example.com (Available)
          </p>
        </div>
        
        <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
          Using credentials from seeded database<br />
          <small>Auto-login in progress...</small>
        </p>
      </div>
    </div>
  );
}