import OpenAI from 'openai';

class AiClient {
  private ai: OpenAI | null = null;
  private currentApiKeyIndex: number = 0;
  private apiKeys: string[] = [];
  private systemInstruction: string = '';
  private currentModel: string = '';
  private messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

  initialize(apiKey: string | string[]) {
    this.apiKeys = Array.isArray(apiKey) ? apiKey : [apiKey];
    this.currentApiKeyIndex = 0;

    if (this.apiKeys.length === 0 || !this.apiKeys[0]) {
      throw new Error('At least one API key is required');
    }

    this.ai = new OpenAI({ apiKey: this.apiKeys[0] });
  }

  private switchToNextApiKey(): boolean {
    if (this.currentApiKeyIndex < this.apiKeys.length - 1) {
      this.currentApiKeyIndex++;
      const nextApiKey = this.apiKeys[this.currentApiKeyIndex];

      if (nextApiKey) {
        console.log(`Switching to API key ${this.currentApiKeyIndex + 1}`);
        this.ai = new OpenAI({ apiKey: nextApiKey });
        return true;
      }
    }

    if (this.currentApiKeyIndex >= this.apiKeys.length - 1) {
      this.currentApiKeyIndex = 0;
      const firstApiKey = this.apiKeys[0];

      if (firstApiKey) {
        console.log('All API keys exhausted, rotating back to first key');
        this.ai = new OpenAI({ apiKey: firstApiKey });
        return false;
      }
    }

    return false;
  }

  async createChat(systemInstruction: string, model: string = 'gpt-4o-mini') {
    if (!this.ai) {
      throw new Error('OpenAI client not initialized');
    }

    this.systemInstruction = systemInstruction;
    this.currentModel = model;
    this.messages = [{ role: 'system', content: systemInstruction }];
  }

  async sendMessageStream(message: string, retryCount: number = 0): Promise<any> {
    if (!this.ai) {
      throw new Error('OpenAI client not initialized');
    }

    this.messages.push({ role: 'user', content: message });

    try {
      const stream = await this.ai.chat.completions.create({
        model: this.currentModel,
        messages: this.messages,
        stream: true,
      });

      // 응답을 메시지 히스토리에 추가하기 위해 래핑
      return this.wrapStream(stream);
    } catch (error: any) {
      // 실패한 user 메시지 롤백
      this.messages.pop();

      const isRateLimitError =
        error.status === 429 ||
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('quota');

      if (isRateLimitError && retryCount < this.apiKeys.length) {
        console.log(`Rate limit detected, attempting to switch API key...`);
        const switched = this.switchToNextApiKey();

        if (switched) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.sendMessageStream(message, retryCount + 1);
        } else if (retryCount === 0) {
          console.log('All API keys exhausted, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.sendMessageStream(message, retryCount + 1);
        }
      }

      throw error;
    }
  }

  // OpenAI 스트림을 기존 route.ts의 chunk.text 인터페이스에 맞게 변환
  private async *wrapStream(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
    let assistantContent = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      assistantContent += text;
      yield { text };
    }

    this.messages.push({ role: 'assistant', content: assistantContent });
  }

  isReady() {
    return this.ai !== null && this.messages.length > 0;
  }

  getMessages() { return this.messages; }
}

export const aiClient = new AiClient();
export default aiClient;
