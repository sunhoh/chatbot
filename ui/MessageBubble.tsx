import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Message } from '../model/types';
import styles from './MessageBubble.module.scss';

interface MessageBubbleProps {
  message: Message;
  onSendMessage?: (message: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSendMessage }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const getAvatar = () => {
    if (message.sender === 'bot') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 8v8l7-4-7-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    );
  };

  // 추천 질문을 클릭 가능하게 처리하는 함수
  const processRecommendationQuestions = (htmlContent: string): string => {
    // "관련 추천 질문" 텍스트가 포함된 경우만 처리
    if (htmlContent.includes('관련 추천 질문') || htmlContent.includes('추천 질문')) {
      // 해당 섹션 다음의 모든 li 태그를 클릭 가능하게 처리
      // [\s\S]를 사용하여 줄바꿈을 포함한 모든 문자 매칭
      return htmlContent.replace(/<li>([\s\S]*?)<\/li>/g, (match, content) => {
        // HTML 태그 제거한 순수 텍스트
        const cleanText = content.replace(/<[^>]*>/g, '').trim();
        // 관련 추천 질문 섹션 아래의 모든 li는 추천 질문으로 처리
        return `<li class="recommendation-question" data-question="${cleanText}">${content}</li>`;
      });
    }
    return htmlContent;
  };

  const getContent = () => {
    let content = message.content;
    if (message.isStreaming) {
      content += '▌';
    }

    if (message.sender === 'bot') {
      // Configure marked for better rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      let parsedContent = marked.parse(content) as string;

      // 추천 질문 처리
      parsedContent = processRecommendationQuestions(parsedContent);
      return {
        __html: parsedContent,
      };
    }

    // For user messages, preserve line breaks
    return { __html: content.replace(/\n/g, '<br/>') };
  };

  // 추천 질문 클릭 이벤트 처리
  useEffect(() => {
    const handleQuestionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 클릭된 요소가 추천 질문인지 확인
      if (
        target.classList.contains('recommendation-question') ||
        target.closest('.recommendation-question')
      ) {
        const questionElement = target.classList.contains('recommendation-question')
          ? target
          : (target.closest('.recommendation-question') as HTMLElement);

        const question = questionElement?.getAttribute('data-question');
        if (question && onSendMessage) {
          onSendMessage(question);
        }
      }
    };

    // 버블에 이벤트 리스너 추가
    if (bubbleRef.current) {
      bubbleRef.current.addEventListener('click', handleQuestionClick);
    }

    return () => {
      if (bubbleRef.current) {
        bubbleRef.current.removeEventListener('click', handleQuestionClick);
      }
    };
  }, [onSendMessage]);

  return (
    <div className={`${styles.messageWrapper} ${styles[message.sender]}`}>
      <div className={styles.avatar}>{getAvatar()}</div>
      <div className={styles.bubble} ref={bubbleRef}>
        <div className={styles.content} dangerouslySetInnerHTML={getContent()} />
      </div>
    </div>
  );
};

export default MessageBubble;
