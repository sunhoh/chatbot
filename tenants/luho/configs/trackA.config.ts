import type { FaqRule } from '@/types/tenant.type'
import { KAKAO, PHONE, RESERVE, PRICE } from './index'

export const TRACK_A_PATTERNS: FaqRule[] = [
  {
    pattern: /눈성형|쌍꺼풀|눈재수술|눈밑|눈매교정|트임|안검|자연유착|절개법/i,
    response:
      '눈성형은 눈재수술, 자연유착법, 절개법, 눈매교정, 트임수술, 눈밑지방재배치, 상/하안검수술 등을 안내드릴 수 있습니다.\n어떤 부분이 고민이신가요? (라인, 졸려 보이는 눈매, 눈밑 꺼짐 등)',
    suggestions: [PRICE, KAKAO, RESERVE],
  },
  {
    pattern: /코성형|코재수술|매부리|낮은코|짧은코|긴코|화살코|복코|콧볼|콧날개|코끝/i,
    response:
      '코성형은 코재수술, 낮은코, 매부리코, 짧은코/긴코, 복코, 콧볼축소, 코끝성형 등을 안내드릴 수 있습니다.\n원하시는 변화가 어떤 부분인지 알려주시면 더 자세히 안내해 드릴게요.',
    suggestions: [PRICE, KAKAO, RESERVE],
  },
  {
    pattern: /리프팅|동안|거상|폭스아이|실리프팅|이물질제거/i,
    response:
      '리프팅/동안 시술은 안면거상술, 미니거상, 폭스아이 실리프팅, 실리프팅, 이물질제거 등이 있습니다.\n정확한 상담은 카카오톡 채널 또는 전화(02.516.0013)로 문의해 주세요.',
    suggestions: [PRICE, KAKAO, RESERVE],
  },
  {
    pattern: /지방이식|지방흡입|쁘띠|보톡스|필러|스킨부스터|펠리컨|쏙오프/i,
    response:
      '지방/쁘띠성형은 루호지방이식, 펠리컨 수술, 쏙오프지방흡입, 보톡스/필러, 스킨부스터 등이 있습니다.\n원하시는 시술이 있으신가요?',
    suggestions: [PRICE, KAKAO, RESERVE],
  },
  {
    pattern: /이마성형|이마거상|이마축소/i,
    response:
      '이마성형은 이마거상, 이마축소 등의 시술이 있습니다.\n상세 상담은 카카오톡 채널 또는 전화(02.516.0013)로 문의해 주세요.',
    suggestions: [PRICE, KAKAO],
  },
  {
    pattern: /위치|주소|어디|찾아가|오시는길|주차/i,
    response:
      '루호성형외과는 서울시 강남구 신사동 신사미타워 4층에 있습니다.\n전화: 02.516.0013 / 02.516.0027\n방문 시간이나 주차 가능 여부는 전화 또는 카카오톡 상담으로 확인해 주세요.',
    suggestions: [PHONE, RESERVE, KAKAO],
  },
  {
    pattern: /모델\s*(지원|신청)|리얼모델/i,
    response:
      '리얼모델 지원은 공식 홈페이지의 리얼모델지원 메뉴에서 확인하실 수 있습니다.\n지원 조건 및 상세 내용은 카카오톡 채널 또는 전화(02.516.0013)로 문의해 주세요.',
    link: 'https://example.com/precautions', // 실제 이미지 URL로 교체
    suggestions: [KAKAO, PHONE],
  },
  {
    pattern: /이벤트|할인|프로모션|행사/i,
    response:
      '현재 진행 중인 이벤트 및 할인 정보는 카카오톡 채널 또는 전화(02.516.0013)로 문의하시면 정확하게 안내해 드릴 수 있습니다.',
    suggestions: [KAKAO, PHONE],
  },
  {
    pattern: /가격|비용|견적|얼마|금액/i,
    response:
      '시술/수술 비용은 개인 상태와 시술 범위에 따라 다르게 책정됩니다.\n정확한 견적은 카카오톡 채널 또는 전화(02.516.0013)로 문의해 주세요.',
    suggestions: [KAKAO, PHONE, RESERVE],
  },
  {
    pattern: /진료\s*시간|영업\s*시간|운영\s*시간/i,
    response:
      '진료/상담 시간은 전화(02.516.0013 / 02.516.0027) 또는 카카오톡 채널로 문의하시면 정확하게 안내해 드릴 수 있습니다.',
    suggestions: [PHONE, KAKAO, RESERVE],
  },
  {
    pattern: /주의사항/i,
    response: '시술/수술 후 주의사항에 대해 알려드릴게요.',
    link: 'https://example.com/precautions', // 실제 이미지 URL로 교체
    suggestions: [KAKAO, PHONE],
  },
]

export const TRACK_A_FALLBACK =
  '죄송합니다, 해당 내용은 제가 확인할 수 있는 범위를 벗어납니다.\n눈성형, 코성형, 리프팅/동안, 지방/쁘띠성형, 예약 안내 중 어떤 상담이 필요하신지 말씀해 주시면 도와드리겠습니다.'
