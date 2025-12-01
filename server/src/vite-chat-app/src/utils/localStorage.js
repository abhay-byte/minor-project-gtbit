// Local storage utility for chat history persistence

const CHAT_STORAGE_KEY = 'clinico_chat_history';

export const loadChatHistory = () => {
  try {
    const serializedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (serializedData === null) {
      return { sessions: [], messages: {} };
    }
    return JSON.parse(serializedData);
  } catch (err) {
    console.error('Error loading chat history from localStorage:', err);
    return { sessions: [], messages: {} };
  }
};

export const saveChatHistory = (history) => {
  try {
    const serializedData = JSON.stringify(history);
    localStorage.setItem(CHAT_STORAGE_KEY, serializedData);
  } catch (err) {
    console.error('Error saving chat history to localStorage:', err);
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing chat history from localStorage:', err);
  }
};

// Session management
export const addSession = (session) => {
  const history = loadChatHistory();
  const existingIndex = history.sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    history.sessions[existingIndex] = { ...history.sessions[existingIndex], ...session };
  } else {
    history.sessions.push(session);
 }
  
  saveChatHistory(history);
 return history;
};

export const removeSession = (sessionId) => {
  const history = loadChatHistory();
  history.sessions = history.sessions.filter(s => s.id !== sessionId);
  history.messages = Object.keys(history.messages).reduce((acc, key) => {
    if (key !== sessionId) {
      acc[key] = history.messages[key];
    }
    return acc;
  }, {});
  
  saveChatHistory(history);
  return history;
};

export const updateSession = (sessionId, updates) => {
  const history = loadChatHistory();
  const sessionIndex = history.sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex >= 0) {
    history.sessions[sessionIndex] = { ...history.sessions[sessionIndex], ...updates };
    saveChatHistory(history);
  }
  
  return history;
};

// Message management
export const getMessages = (sessionId) => {
  const history = loadChatHistory();
  return history.messages[sessionId] || [];
};

export const addMessage = (sessionId, message) => {
  const history = loadChatHistory();
  if (!history.messages[sessionId]) {
    history.messages[sessionId] = [];
  }
  history.messages[sessionId].push(message);
  saveChatHistory(history);
  return history;
};

export const setMessages = (sessionId, messages) => {
  const history = loadChatHistory();
  history.messages[sessionId] = messages;
 saveChatHistory(history);
  return history;
};