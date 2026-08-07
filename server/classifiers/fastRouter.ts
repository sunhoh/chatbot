import type { FaqRule } from '@/types/tenant.type'
import type { Intent, RoutePattern } from '@/types/intent.type'
import { TRACK_B_PATTERNS } from '../../tenants/luho/configs/trackB.config'

export type { Intent }

export interface RouterResult {
  matched: boolean
  intent: Intent
  confidence: number
  params?: Record<string, string>
}

// Track B — 고정 라우팅 패턴 (예약 생성/취소/조회)
// const ROUTES: RoutePattern[] = [...TRACK_B_PATTERNS]

export function fastRoute(message: string, faqRules: FaqRule[] = [], trackCRules: FaqRule[] = []): RouterResult {
  // for (const route of ROUTES) {
  //   if (route.pattern.test(message)) {
  //     return { matched: true, intent: route.intent, confidence: route.confidence }
  //   }
  // }

  for (const rule of trackCRules) {
    if (rule.pattern.test(message)) {
      return { matched: true, intent: 'TRACK_C', confidence: 0.9 }
    }
  }

  for (const rule of faqRules) {
    if (rule.pattern.test(message)) {
      return { matched: true, intent: 'TRACK_A', confidence: 0.9 }
    }
  }

  return { matched: false, intent: 'TRACK_D', confidence: 0 }
}
