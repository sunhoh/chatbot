import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styles from './ChatInput.module.scss';
import { UpdateChatHistory } from '../model/api/request';
import { ChatHistory, Message } from '../model/types';
import { getSessionStorageUserInfo } from '@/shared/utils/sessionStorage';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  botMessages: Message[];
}

const ChatInput = forwardRef<any, ChatInputProps>(
  ({ onSendMessage, isLoading, disabled, botMessages }, ref) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const userInfo = getSessionStorageUserInfo();
    const sessionId = localStorage.getItem('anon_session_id');

    // forwardRef를 통해 외부에서 호출 가능한 메서드 노출
    useImperativeHandle(ref, () => ({
      setMessageAndSend: (newMessage: string) => {
        setMessage(newMessage);
        // 약간의 딜레이 후 자동 전송
        setTimeout(() => {
          if (!isLoading && !disabled) {
            onSendMessage(newMessage);
            setMessage('');
          }
        }, 100);
      },
    }));

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    useEffect(() => {
      adjustHeight();
    }, [message, adjustHeight]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUpdateChatHistory();
      }
    };

    const handleUpdateChatHistory = async () => {
      const trimmed = message.trim();
      if (trimmed && !isLoading && !disabled) {
        onSendMessage(trimmed);
        setMessage('');
      }
      const chatHistory: ChatHistory = {
        session_id: '',
        user_message: message,
        bot_response: botMessages[botMessages.length - 1].content,
        user_id: '',
        response_time_seconds: botMessages[botMessages.length - 1].responseTime || 0,
        meta: {
          ip_address: '',
          timestamp: '',
          user_agent: '',
        },
      };
      if (userInfo?.userId) {
        chatHistory.user_id = userInfo.userId;
      } else if (sessionId) {
        chatHistory.session_id = sessionId;
      }

      const response = await UpdateChatHistory(chatHistory);
    };

    return (
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '챗봇을 초기화하는 중입니다...' : '여기에 메시지를 입력하세요...'}
          disabled={disabled || isLoading}
          rows={1}
          className={styles.textarea}
        />
        <button
          onClick={handleUpdateChatHistory}
          disabled={!message.trim() || isLoading || disabled}
          className={styles.sendButton}
          aria-label="메시지 전송"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
