import type { FaqRule } from '@/types/tenant.type'
import { KAKAO, PHONE } from './index'

export const TRACK_C_PATTERNS: FaqRule[] = [
  {
    pattern: /예약\s*안내/i,
    response: '예약은 아래 링크로 이동하시면 하실 수 있습니다. 예약전 상담을 원하시면 상담사가 도와드립니다.',
    link: 'https://example.com/reservation',
    suggestions: [KAKAO, PHONE],
  },
  {
    pattern: /^진료\/상담$|카카오\s*(톡|채널|문의|상담)|상담사?\s*(연결|연락|직접|통화)/i,
    response: '카카오톡 채널을 통해 상담사와 직접 대화하실 수 있습니다.',
    suggestions: [KAKAO, PHONE],
  },
]
export const TRACK_C_FALLBACK = '카카오톡 채널을 통해 상담사와 직접 대화하실 수 있습니다.'
