import { GoogleGenAI, Chat } from '@google/genai';

class GenAIClient {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;
  private currentApiKeyIndex: number = 0;
  private apiKeys: string[] = [];
  private systemInstruction: string = '';
  private currentModel: string = '';

  // API 키 세팅
  initialize(apiKey: string | string[]) {
    this.apiKeys = Array.isArray(apiKey) ? apiKey : [apiKey];
    this.currentApiKeyIndex = 0;

    if (this.apiKeys.length === 0 || !this.apiKeys[0]) {
      throw new Error('At least one API key is required');
    }

    this.ai = new GoogleGenAI({ apiKey: this.apiKeys[0] });

  }
  // Rate limit 시 키 교체
  private switchToNextApiKey(): boolean {
    // 다음 API 키로 전환
    if (this.currentApiKeyIndex < this.apiKeys.length - 1) {
      this.currentApiKeyIndex++;
      const nextApiKey = this.apiKeys[this.currentApiKeyIndex];

      if (nextApiKey) {
        console.log(`Switching to API key ${this.currentApiKeyIndex + 1}`);
        this.ai = new GoogleGenAI({ apiKey: nextApiKey });

        // 채팅 세션 재생성
        if (this.systemInstruction && this.currentModel) {
          this.chat = this.ai.chats.create({
            model: this.currentModel,
            config: {
              systemInstruction: this.systemInstruction,
            },
          });
        }

        return true;
      }
    }

    // 모든 키를 사용했다면 처음부터 다시 시작
    if (this.currentApiKeyIndex >= this.apiKeys.length - 1) {
      this.currentApiKeyIndex = 0;
      const firstApiKey = this.apiKeys[0];

      if (firstApiKey) {
        console.log('All API keys exhausted, rotating back to first key');
        this.ai = new GoogleGenAI({ apiKey: firstApiKey });

        // 채팅 세션 재생성
        if (this.systemInstruction && this.currentModel) {
          this.chat = this.ai.chats.create({
            model: this.currentModel,
            config: {
              systemInstruction: this.systemInstruction,
            },
          });
        }

        // 일정 시간 대기 후 재시도하도록 알림
        return false; // 모든 키가 exhausted 상태
      }
    }

    return false;
  }
  // 세션 생성 (시스템 규칙+지식 적용)
  async createChat(systemInstruction: string, model: string = 'gemini-2.0-flash-exp') {
    if (!this.ai) {
      throw new Error('GenAI client not initialized');
    }

    // 시스템 지시사항과 모델 저장 (재연결 시 사용)
    this.systemInstruction = systemInstruction;
    this.currentModel = model;

    this.chat = this.ai.chats.create({
      model,
      config: {
        systemInstruction,
      },
    });

    return this.chat;
  }

  // 스트리밍 응답 처리
  async sendMessageStream(message: string, retryCount: number = 0): Promise<any> {
    if (!this.chat) {
      throw new Error('Chat not initialized');
    }

    try {
      return await this.chat.sendMessageStream({ message });
    } catch (error: any) {
      // Rate limit 또는 quota exceeded 에러 체크
      const isRateLimitError =
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('quota') ||
        error.message?.toLowerCase().includes('429') ||
        error.status === 429 ||
        error.code === 'RESOURCE_EXHAUSTED';

      if (isRateLimitError && retryCount < this.apiKeys.length) {
        console.log(`Rate limit detected, attempting to switch API key...`);

        const switched = this.switchToNextApiKey();

        if (switched) {
          // 새 API 키로 재시도
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
          return this.sendMessageStream(message, retryCount + 1);
        } else if (retryCount === 0) {
          // 모든 키가 exhausted 상태이지만 첫 번째 시도인 경우
          console.log('All API keys exhausted, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
          return this.sendMessageStream(message, retryCount + 1);
        }
      }

      // 다른 에러거나 모든 재시도 실패
      throw error;
    }
  } 
  // 현재 상태 확인
  getChat() { return this.chat; }
}

export const genAIClient = new GenAIClient();
export default genAIClient;