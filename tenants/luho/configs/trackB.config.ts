import type { RoutePattern } from '@/types/intent.type'

export const TRACK_B_PATTERNS: RoutePattern[] = [
  { pattern: /예약\s*(취소|취소하고|취소할|취소해)/i,          intent: 'TRACK_B_CANCEL',  confidence: 0.95 },
  { pattern: /예약\s*(하고|할|신청|잡아|잡을|해줘|해주세요)/i, intent: 'TRACK_B_CREATE',  confidence: 0.95 },
  { pattern: /예약\s*(조회|확인|언제|날짜|몇시)/i,             intent: 'TRACK_B_INQUIRY', confidence: 0.95 },
]
