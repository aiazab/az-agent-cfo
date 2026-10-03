import React, { useState, useRef, useEffect } from 'react';
import { Stack, TextField, IconButton, ScrollablePane, Spinner, MessageBar, MessageBarType } from '@fluentui/react';
import { SendIcon } from '@fluentui/react-icons';
import { chatAPI, ChatMessage, AgentResponse } from '../api/client';
import './ChatComponent.css';

interface ChatComponentProps {
  userId: string;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response: AgentResponse = await chatAPI.sendMessage(userId, inputValue);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('فشل إرسال الرسالة. حاول مرة أخرى');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Stack className="chat-container" tokens={{ childrenGap: 10 }}>
      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <ScrollablePane className="messages-container" ref={scrollableRef}>
        <Stack tokens={{ childrenGap: 15 }} className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
              <div className="message-content">
                <p>{msg.content}</p>
                <small className="message-time">
                  {msg.timestamp.toLocaleTimeString('ar-SA')}
                </small>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message message-loading">
              <div className="message-avatar">🤖</div>
              <Spinner label="جاري الرد..." />
            </div>
          )}
        </Stack>
      </ScrollablePane>

      <Stack horizontal tokens={{ childrenGap: 10 }} className="input-area">
        <TextField
          placeholder="اكتب رسالتك هنا..."
          multiline
          rows={2}
          value={inputValue}
          onChange={(e, val) => setInputValue(val || '')}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="chat-input"
        />
        <IconButton
          iconProps={{ iconName: 'Send' }}
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        />
      </Stack>
    </Stack>
  );
};
