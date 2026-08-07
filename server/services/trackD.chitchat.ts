import { buildTextResponse } from '../utils/response'
import type { BotResponse } from '../utils/response'

const BASE_PROMPT = '항상 한국어로 답변하며, 친절하고 전문적인 상담원 말투를 유지하세요.'

export async function handleChitchat(message: string, profile?: string): Promise<BotResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return buildTextResponse(FALLBACK)

  const systemPrompt = profile ? `${profile}\n\n${BASE_PROMPT}` : BASE_PROMPT

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? FALLBACK
    return buildTextResponse(text)
  } catch {
    return buildTextResponse(FALLBACK)
  }
}

const FALLBACK = '죄송해요, 잠시 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
