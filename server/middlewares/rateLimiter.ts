// 스팸/도배 방지 — 서버리스 환경에서 in-memory 윈도우 방식 사용
// 프로덕션에서는 Redis(Upstash 등)로 교체 권장

interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

const WINDOW_MS = 60_000  // 1분
const MAX_REQUESTS = 20   // 분당 최대 요청 수

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt }
}

// 오래된 항목 주기적 정리
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, WINDOW_MS)
