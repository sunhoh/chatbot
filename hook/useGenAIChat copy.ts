import { useState, useCallback, useEffect } from 'react';
import { loadKnowledgeBase, loadRules, createSystemInstruction } from '../utils/knowledgeLoader'
import genAIClient from '../utils/genAIClient';

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}


export const useGenAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    const initCaht = async () => {
      try{
        const genaiKeys = [
          process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY,
          process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_SUB_KEY,
        ].filter((key): key is string => key !== undefined);
        genAIClient.initialize(genaiKeys);
        const model = 'gemini-2.0-flash-exp';

        const knowledgeBase = await loadKnowledgeBase();
        const rules = await loadRules();
        const systemInstruction = createSystemInstruction(knowledgeBase, rules);
        await genAIClient.createChat(systemInstruction, model);

        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            content:
              '안녕하세요! 고객센터입니다. 무엇을 도와드릴까요?\n\ 서비스, 이용 방법등 궁금하신 점을 말씀해 주시면,\n최선을 다해 답변 드리겠습니다.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setError(null);

      }catch(error){
        console.error('Failed to initialize chat:', error);
        setError('챗봇을 초기화하는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally{
        setIsInitializing(false);
      }
    }
    initCaht()
  },[])

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

      try {
        const startTime = Date.now(); // 시작 시간 기록

        const responseStream = await genAIClient.sendMessageStream(content);
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: '',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);

        let fullResponse = '';
        for await (const chunk of responseStream) {
          fullResponse += chunk.text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.id === botMessage.id) {
              lastMessage.content = fullResponse;
            }
            return newMessages;
          });
        }

        const endTime = Date.now(); // 끝 시간 기록
        const responseTime = (endTime - startTime) / 1000; // 초 단위
        // botMessage.responseTime = responseTime;

        // 응답 시간을 메시지에 포함하고 싶다면:
        fullResponse += `\n\n⏱️ 응답 시간: ${responseTime}초`;

        // Mark streaming as complete
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          // if (lastMessage && lastMessage.id === botMessage.id) {
          //   lastMessage.isStreaming = false;
          // }
          return newMessages;
        });
      } catch (err: any) {
        console.error('Error sending message:', err);

        // Rate limit 에러인 경우 특별한 메시지 표시
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
            ? '현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요. (자동으로 다른 API 키로 전환 중...)'
            : '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );
  return {
    messages,
    sendMessage,
    isLoading,
    isInitializing,
    error,
  };
}