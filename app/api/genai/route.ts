import { NextRequest, NextResponse } from 'next/server';
import aIClient from '@/utils/aIClient';
import { loadKnowledgeBase, loadRules, createSystemInstruction } from '@/utils/knowledgeLoader';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Server-side knowledge loader
async function loadKnowledgeBaseServer(): Promise<string> {
  try {
    const filePath = join(process.cwd(), 'public', 'faq.md');
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    throw error;
  }
}

async function loadRulesServer(): Promise<string> {
  try {
    const filePath = join(process.cwd(), 'public', 'rules.md');
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error loading rules:', error);
    throw error;
  }
}

// Initialize chat session (cached per request)
let chatInitialized = false;

async function initializeChat() {
  if (chatInitialized) return;

  const genaiKeys = [
    process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY,
    process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_SUB_KEY,
  ].filter((key): key is string => key !== undefined && key !== '');

  if (genaiKeys.length === 0) {
    throw new Error('No API keys configured');
  }

  aIClient.initialize(genaiKeys);
  const model = 'gemini-2.0-flash-exp';

  const knowledgeBase = await loadKnowledgeBaseServer();
  const rules = await loadRulesServer();
  const systemInstruction = createSystemInstruction(knowledgeBase, rules);

  await aIClient.createChat(systemInstruction, model);
  chatInitialized = true;
}

export async function POST(request: NextRequest) {
  try {
    const { message, isInitialRequest } = await request.json();

    // Initialize chat if this is the first request
    if (isInitialRequest) {
      await initializeChat();
      return NextResponse.json({
        success: true,
        welcomeMessage: '안녕하세요! 고객센터입니다. 무엇을 도와드릴까요?\n서비스, 이용 방법등 궁금하신 점을 말씀해 주시면,\n최선을 다해 답변 드리겠습니다.',
      });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Ensure chat is initialized
    await initializeChat();

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await aIClient.sendMessageStream(message);

          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Streaming error:', error);

          const errorMessage = error.message?.toLowerCase().includes('rate limit') ||
                              error.message?.toLowerCase().includes('quota')
            ? '현재 요청이 많아 잠시 후 다시 시도해주세요.'
            : '메시지를 처리하는 중 오류가 발생했습니다.';

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}