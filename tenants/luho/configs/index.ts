import type { Suggestion } from '@/types/tenant.type'

export const KAKAO: Suggestion = { label: '카톡 상담', type: 'link', url: 'https://pf.kakao.com/_루호채널ID' }
export const PHONE: Suggestion = { label: '전화 상담', type: 'phone', number: '02-516-0013' }
export const RESERVE: Suggestion = { label: '예약 안내', type: 'message', text: '예약 안내' }
export const PRICE: Suggestion = { label: '가격 문의', type: 'message', text: '가격 문의' }


export { TRACK_A_PATTERNS, TRACK_A_FALLBACK } from './trackA.config'