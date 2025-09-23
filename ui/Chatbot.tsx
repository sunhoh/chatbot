'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import ChatHeader from './ui/ChatHeader';
import MessageList from './ui/MessageList';
import ChatInput from './ui/ChatInput';
import { useGenAIChat } from './model/hooks/useGenAIChat';
import { useThemeContext } from '@/features/theme/useThemeContext';
import styles from './Chatbot.module.scss';

const Chatbot: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { messages: botMessages, sendMessage, isLoading, isInitializing } = useGenAIChat();
  const { isTheme } = useThemeContext();

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatInputRef = useRef<any>(null);

  const toggleChatbot = () => {
    if (isOpen) {
      setIsClosing(true);
      setIsOpen(false);
      setTimeout(() => {
        setIsClosing(false);
        setIsVisible(false);
      }, 200);
    } else {
      setIsVisible(true);
      setTimeout(() => {
        setIsOpen(true);
      }, 10);
    }
  };

  const handleScroll = () => {
    if (isOpen) return;

    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

    if (scrollDifference > 100 && (currentTime - lastScrollTime.current > 100 || !isAnimating)) {
      if (isAnimating && animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        setIsAnimating(false);
      }

      setIsAnimating(true);
      lastScrollTime.current = currentTime;

      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }

    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isOpen, isAnimating]);

  return (
    <>
      <button
        onClick={toggleChatbot}
        className={`${styles.chatbotButton} ${isAnimating ? styles.bounce : ''}`}
        aria-label="Open Chatbot"
      >
        <span className={styles.iconWrapper}>
          <FaComments size={24} />
        </span>
      </button>

      {isVisible && (
        <div
          className={`${styles.chatbotContainer} ${styles.visible} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}
        >
          <ChatHeader onClose={toggleChatbot} />
          <MessageList
            messages={botMessages}
            isTyping={isLoading}
            onSendMessage={(message: string) => {
              // ChatInput에 메시지 설정하고 자동 전송
              if (chatInputRef.current) {
                chatInputRef.current.setMessageAndSend(message);
              }
            }}
          />
          <ChatInput
            ref={chatInputRef}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            disabled={isInitializing}
            botMessages={botMessages}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
