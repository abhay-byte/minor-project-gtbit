const BASE_URL = "http://localhost:5000";

// Base API function with token refresh capability
async function apiCall(url, options = {}, token) {
  let response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
  
  // If unauthorized, try to refresh token or redirect to login
  if (response.status === 401) {
    // Token might be expired, redirect to login
    window.location.href = '/'; // Redirect to login page
    throw new Error('Token expired. Please login again.');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function fetchConversations(token) {
  try {
    const response = await apiCall(`${BASE_URL}/api/conversations`, {}, token);
    
    return response;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function fetchMessages(conversationId, token) {
  try {
    const response = await apiCall(`${BASE_URL}/api/conversations/${conversationId}/messages`, {}, token);
    
    return response;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function sendMessage(conversationId, token, content) {
  try {
    const response = await apiCall(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message_content: content,
        message_type: "Text"
      })
    }, token);
    
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// AI Chat API functions
export async function fetchAISessions(token) {
  try {
    const response = await apiCall(`${BASE_URL}/api/ai/sessions`, {}, token);
    
    // Transform the response if needed
    if (Array.isArray(response)) {
      return response.map(session => ({
        session_id: session.session_id,
        session_summary: session.session_summary,
        session_type: session.session_type,
        started_at: session.started_at,
        last_updated: session.last_updated || session.updated_at,
        crisis_flag: session.crisis_detected || session.crisis_flag
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching AI sessions:', error);
    throw error;
  }
}

export async function fetchAIMessages(sessionId, token) {
  try {
    const response = await apiCall(`${BASE_URL}/api/ai/sessions/${sessionId}/messages`, {}, token);
    
    // Transform the response to match the expected message format
    if (Array.isArray(response)) {
      return response.map(msg => ({
        role: msg.role || (msg.sender_type === 'AI Assistant' ? 'assistant' : 'user'),
        message: msg.message_content || msg.answer || msg.message,
        timestamp: msg.sent_at || msg.timestamp,
        image_url: msg.image_url || null
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching AI messages:', error);
    throw error;
  }
}

export async function sendAIQuery(query, token, sessionId = null) {
  try {
    const body = {
      query: query,
      session_id: sessionId || undefined  // Only include session_id if provided
    };
    
    const response = await apiCall(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      body: JSON.stringify(body)
    }, token);
    
    // Map the AI server response to the expected format
    return {
      session_id: response.session_id || response.sessionId,
      reply: response.answer || response.reply || response.message || "I encountered an issue processing your request. Please try again.",
      action: response.action || response.intent || "",
      crisis_detected: response.crisis_detected || response.crisisDetected || false,
      timestamp: response.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending AI query:', error);
    // Return a default error response structure
    return {
      session_id: sessionId,
      reply: "I encountered an issue processing your request. Please try again.",
      action: "",
      crisis_detected: false,
      timestamp: new Date().toISOString()
    };
  }
}

export async function deleteAISession(sessionId, token) {
  try {
    const response = await apiCall(`${BASE_URL}/api/ai/sessions/${sessionId}`, {
      method: "DELETE"
    }, token);
    
    return response;
  } catch (error) {
    console.error('Error deleting AI session:', error);
    throw error;
  }
}