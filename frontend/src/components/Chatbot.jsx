import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your patient data assistant. I can help you search for patients, find information by ID, filter by blood type or allergies, and more. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Build conversation history (excluding system message)
      const conversationHistory = newMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await api.sendChatMessage(userMessage, conversationHistory);

      if (response.success) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: response.message,
            toolCalls: response.toolCalls
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `Error: ${response.error || 'Failed to get response'}`
          }
        ]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to send message'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>💬 Chat with AI Assistant</h2>
        <p className="chat-subtitle">Ask me anything about patients, and I'll use MCP tools to find the information!</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="tool-calls-indicator">
                    🔧 Used {msg.toolCalls.length} MCP tool{msg.toolCalls.length > 1 ? 's' : ''}: {msg.toolCalls.map(tc => tc.function.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message-text">
                  <span className="typing-indicator">
                    <span></span><span></span><span></span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about patients... (e.g., 'Show me all patients', 'Find patient P001', 'Who has blood type A+?')"
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
            {loading ? '⏳' : '📤'}
          </button>
        </form>
      </div>

      <div className="chat-examples">
        <p className="examples-title">💡 Example questions:</p>
        <div className="example-buttons">
          <button
            className="example-btn"
            onClick={() => setInput('Show me all patients')}
            disabled={loading}
          >
            Show all patients
          </button>
          <button
            className="example-btn"
            onClick={() => setInput('Find patient with ID P001')}
            disabled={loading}
          >
            Find patient P001
          </button>
          <button
            className="example-btn"
            onClick={() => setInput('Who has blood type A+?')}
            disabled={loading}
          >
            Patients with A+ blood
          </button>
          <button
            className="example-btn"
            onClick={() => setInput('Find patients allergic to Penicillin')}
            disabled={loading}
          >
            Penicillin allergies
          </button>
          <button
            className="example-btn"
            onClick={() => setInput('Search for patients named John')}
            disabled={loading}
          >
            Search for John
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

