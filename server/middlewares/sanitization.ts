// 악성 입력 필터링 — XSS, 프롬프트 인젝션, 과도한 길이 차단

const MAX_MESSAGE_LENGTH = 2000

// 프롬프트 인젝션 패턴
const INJECTION_PATTERNS = [
  /ignore (all |previous |above )?instructions?/i,
  /you are now/i,
  /system prompt/i,
  /jailbreak/i,
  /<script[\s\S]*?>/i,
]

// HTML 특수문자 이스케이프
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export interface SanitizeResult {
  safe: boolean
  sanitized: string
  reason?: string
}

export function sanitizeInput(input: string): SanitizeResult {
  if (!input || typeof input !== 'string') {
    return { safe: false, sanitized: '', reason: '유효하지 않은 입력입니다.' }
  }

  if (input.length > MAX_MESSAGE_LENGTH) {
    return { safe: false, sanitized: '', reason: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하여야 합니다.` }
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, sanitized: '', reason: '허용되지 않는 내용이 포함되어 있습니다.' }
    }
  }

  const sanitized = escapeHtml(input.trim())
  return { safe: true, sanitized }
}
