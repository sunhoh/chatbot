import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from '../model/types';
import styles from './MessageList.module.scss';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage?: (message: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, onSendMessage }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div ref={containerRef} className={styles.messageList}>
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} onSendMessage={onSendMessage} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
};

export default MessageList;
