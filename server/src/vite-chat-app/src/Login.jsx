import React, { useState } from "react";
import { fetchConversations } from "./api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Attempt to login with the provided credentials
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (data.success && data.token) {
        // Store user info
        const userData = {
          role: data.user.role,
          token: data.token,
          user: data.user,
        };
        
        onLogin(userData);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-seeded credentials for testing
  const preSeededUsers = {
    patient: {
      email: "abhay.raj@example.com",
      password: "password123"
    },
    doctor: {
      email: "amit.patel@example.com",
      password: "password123"
    }
  };

  const handlePreSeededLogin = async (userType) => {
    const user = preSeededUsers[userType];
    setEmail(user.email);
    setPassword(user.password);
    
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (data.success && data.token) {
        // Store user info
        const userData = {
          role: data.user.role,
          token: data.token,
          user: data.user,
        };
        
        onLogin(userData);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message);
      console.error("Pre-seeded login error:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Login to Continue</h2>
        
        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "15px", textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: "15px", textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "15px"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "10px", color: "#666" }}>Or use pre-seeded accounts:</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => handlePreSeededLogin('patient')}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
              disabled={loading}
            >
              Patient Login
            </button>
            <button
              onClick={() => handlePreSeededLogin('doctor')}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
              disabled={loading}
            >
              Doctor Login
            </button>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#e9ecef", 
          padding: "15px", 
          borderRadius: "4px", 
          textAlign: "left"
        }}>
          <p style={{ margin: "5px 0", color: "#155724", fontSize: "14px" }}>
            <strong>Pre-seeded Credentials:</strong>
          </p>
          <p style={{ margin: "5px 0", color: "#666", fontSize: "13px" }}>
            <strong>Patient:</strong> abhay.raj@example.com / password123
          </p>
          <p style={{ margin: "5px 0", color: "#666", fontSize: "13px" }}>
            <strong>Doctor:</strong> amit.patel@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}