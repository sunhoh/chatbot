import type { TenantConfig } from '@/types/tenant.type'
import { TRACK_A_PATTERNS, TRACK_A_FALLBACK } from '@/tenants/luho/configs/trackA.config'
import { TRACK_C_PATTERNS, TRACK_C_FALLBACK } from '@/tenants/luho/configs/trackC.config'

export const luho: TenantConfig = {
  tenantKey: 'luho',
  displayName: 'Luho',
  welcomeMessage:
    '안녕하세요, 루호성형외과 AI 챗봇입니다.\n눈성형, 코성형, 리프팅, 쁘띠성형 상담이나 예약 안내가 필요하시면 편하게 말씀해 주세요.',
  theme: {
    primaryColor: '#29231F',
    backgroundColor: '#FFFDF9',
    botName: 'Luho AI BOT',
    logoFallback: 'L',
    position: 'right',
    width: '380px',
    height: '600px',
    placeholder: '상담 내용을 입력해 주세요...',
    suggestedQuestions: ['이벤트', '진료/상담', '모델 지원', '예약 안내', '시술/수술 후 주의사항'],
  },
  rules: [{ trackA: TRACK_A_PATTERNS, trackC: TRACK_C_PATTERNS }],
  fallback: [{ trackA: TRACK_A_FALLBACK, trackC: TRACK_C_FALLBACK }],
  guide: {
    profile: 'tenants/luho/profile.md',
    rules: 'tenants/luho/rules.md'
  },
}
