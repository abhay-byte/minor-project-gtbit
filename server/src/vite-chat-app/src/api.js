const BASE_URL = "http://localhost:5000"; // change if needed

export async function fetchConversations(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/conversations`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function fetchMessages(conversationId, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function sendMessage(conversationId, token, content) {
  try {
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_content: content,
        message_type: "Text"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}