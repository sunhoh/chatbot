import { useState, useCallback, useEffect } from 'react';
import type { Suggestion } from '@/types/tenant.type';

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  link?: string
}

interface UseChatOptions {
  tenantKey?: string
}

export const useChat = (options: UseChatOptions) => {
  const { tenantKey } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | undefined>(undefined);

  useEffect(()=>{
    const initChat = async () => {
      try{
        // -----------------------------------
        // Call backend API to initialize chat
        // -----------------------------------
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isInitialRequest: true, tenantKey }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize chat');
        }

        const data = await response.json();

        // Add welcome message
        if (data.welcomeMessage) {
          setMessages([
            {
              id: 'welcome',
              content: data.welcomeMessage,
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
        setError(null);

      }catch(error){
        console.error('Failed to initialize chat:', error);
        setError('챗봇을 초기화하는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally{
        setIsInitializing(false);
      }
    }
    initChat()
  },[tenantKey])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setSuggestions(undefined);

      try {
        const startTime = Date.now();

        // -----------------------------------
        // Call backend API for streaming response
        // -----------------------------------
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: content, tenantKey }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: '',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);

        // -----------------------------------
        // Read streaming response
        // -----------------------------------
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (!reader) {
          throw new Error('No reader available');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.done) {
                  setSuggestions(parsed.suggestions);
                  if (parsed.link) {
                    setMessages(prev => {
                      const next = [...prev];
                      const last = next[next.length - 1];
                      if (last?.id === botMessage.id) last.link = parsed.link;
                      return next;
                    });
                  }
                  break;
                }

                if (parsed.text) {
                  fullResponse += parsed.text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.id === botMessage.id) {
                      lastMessage.content = fullResponse;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
                console.log('eee', e)
              }
            }
          }
        }

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

      } catch (err: any) {
        console.error('Error sending message:', err);

        const isRateLimitError =
          err.message?.toLowerCase().includes('rate limit') ||
          err.message?.toLowerCase().includes('quota') ||
          err.message?.toLowerCase().includes('exhausted');

        if (isRateLimitError) {
          setError('현재 요청이 많아 잠시 후 다시 시도해주세요.');
        } else {
          setError('메시지를 전송하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: isRateLimitError
            ? '현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
            : '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, tenantKey],
  );

  return {
    messages,
    sendMessage,
    isLoading,
    isInitializing,
    error,
    suggestions,
  };
}
