// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBot = ({ farmData, prediction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        crop: farmData.crop,
        state: farmData.state,
        yield_min: prediction ? prediction - 2 : 0,
        yield_max: prediction ? prediction + 2 : 0,
        soil_ph: farmData.soil_ph,
        rainfall: farmData.annual_rainfall,
      };
      const res = await axios.post('http://localhost:8000/chat', {
        message: input,
        context,
      });
      const botMsg = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am offline. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--emerald-500)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '360px',
            height: '500px',
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--emerald-500)',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>AgriBuddy AI Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                Ask me about crop management, soil health, or yield improvement.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? 'var(--emerald-500)' : 'var(--border-color)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--border-color)', padding: '8px 12px', borderRadius: '16px', color: 'white' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                color: 'white',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--emerald-500)',
                border: 'none',
                borderRadius: '24px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;