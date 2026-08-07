import { NextRequest, NextResponse } from 'next/server';
import { getTenantConfig } from '@/utils/tenant.utils';
import { runPipeline } from '@/server';
import type { BotResponse } from '@/server/utils/response';
import type { Suggestion } from '@/types/tenant.type';

function extractText(res: BotResponse): string {
  const output = res.template.outputs[0];
  if (output?.simpleText) return output.simpleText.text;
  if (output?.basicCard) return `${output.basicCard.title}\n${output.basicCard.description}`;
  return '';
}

function cannedSseResponse(text: string, suggestions?: Suggestion[], link?: string): NextResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, suggestions, link })}\n\n`));
      controller.close();
    },
  });
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, isInitialRequest, tenantKey, buttonPayload } = await request.json();

    if (isInitialRequest) {
      const tenant = getTenantConfig(tenantKey);
      return NextResponse.json({ success: true, welcomeMessage: tenant.welcomeMessage });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { response, suggestions, link } = await runPipeline({ message, userId, buttonPayload, tenantKey });
    const text = extractText(response);

    return cannedSseResponse(text, suggestions, link);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
