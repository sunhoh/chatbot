export type Intent =
  | 'TRACK_A'          // FAQ (비인증 영역 — 시술, 위치, 이벤트 등)
  | 'TRACK_B_CREATE'   // 예약 생성
  | 'TRACK_B_CANCEL'   // 예약 취소
  | 'TRACK_B_INQUIRY'  // 예약 조회
  | 'TRACK_C'          // 카카오 상담 연결
  | 'TRACK_D'          // 기본 응답 (인사 / 잡담 / 분류 불가)

export interface RoutePattern {
  pattern: RegExp
  intent: Intent
  confidence: number
  response?: string
}
