// 2단계: LLM 기반 JSON Intent 추출
// fastRouter가 UNKNOWN을 반환했을 때만 호출하여 비용 최소화

import { Intent } from './fastRouter'

export interface LLMIntent {
  intent: Intent
  confidence: number
  entities: {
    date?: string
    time?: string
    department?: string
    patientName?: string
  }
  rawResponse?: string
}

const SYSTEM_PROMPT = `
당신은 병원 챗봇의 의도 분류기입니다.
사용자 메시지를 분석하여 반드시 아래 JSON 형식으로만 응답하세요.

가능한 intent 값:
- TRACK_A: FAQ / 일반 문의 (시술, 위치, 이벤트, 가격, 모델지원 등)
- TRACK_B_CREATE: 예약 생성
- TRACK_B_CANCEL: 예약 취소
- TRACK_B_INQUIRY: 예약 조회
- TRACK_C: 카카오 채널 연결 요청
- TRACK_D: 인사 / 잡담 / 분류 불가

응답 형식:
{
  "intent": "...",
  "confidence": 0.0~1.0,
  "entities": {
    "date": "YYYY-MM-DD 또는 null",
    "time": "HH:MM 또는 null",
    "department": "진료과 또는 null",
    "patientName": "이름 또는 null"
  }
}
`.trim()

export async function classifyWithLLM(message: string): Promise<LLMIntent> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return fallbackIntent()
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 200,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
    })

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(content)

    return {
      intent: parsed.intent ?? 'UNKNOWN',
      confidence: parsed.confidence ?? 0,
      entities: parsed.entities ?? {},
      rawResponse: content,
    }
  } catch {
    return fallbackIntent()
  }
}

function fallbackIntent(): LLMIntent {
  return { intent: 'TRACK_D', confidence: 0, entities: {} }
}
