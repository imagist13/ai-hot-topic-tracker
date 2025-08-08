import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import { useWebSocket } from '../hooks/useWebSocket';

interface Message {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket('ws://localhost:8000/ws');

  // Add welcome message on component mount
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        message: `👋 Hello! I'm your AI Hot Topic Tracker assistant. I can help you:

• **Track topics**: Say "Track AI breakthroughs" to start monitoring news
• **List tasks**: Ask "Show my tasks" to see what you're tracking
• **Delete tasks**: Say "Delete task 1" to remove a task
• **Get help**: Type "help" for more information

What would you like to track today?`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'response') {
          // Bot response to user message
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'bot',
            message: data.message,
            timestamp: new Date(),
          }]);
          setIsTyping(false);
        } else if (data.type === 'task_result') {
          // Real-time task result notification
          const resultMessage = `🎯 **${data.task_name}** completed!

📊 **Summary**: ${data.result.summary}

📈 **Sentiment**: ${data.result.sentiment} ${data.result.sentiment_emoji}

📋 **Key Points**:
${data.result.key_points.map((point: string) => `• ${point}`).join('\n')}

🔢 **Data Count**: ${data.result.data_count} items analyzed`;

          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'bot',
            message: resultMessage,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Send message via WebSocket
    sendMessage({
      type: 'chat_message',
      message: inputMessage,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (message: string) => {
    // Simple markdown-like formatting
    let formatted = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    
    return { __html: formatted };
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>AI Assistant</h2>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected'}
          {connectionStatus === 'connecting' && '🟡 Connecting...'}
          {connectionStatus === 'disconnected' && '🔴 Disconnected'}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type}`}
          >
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div
                className="message-text"
                dangerouslySetInnerHTML={formatMessage(message.message)}
              />
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (e.g., 'Track cryptocurrency news')"
            rows={1}
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
            className="send-button"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
