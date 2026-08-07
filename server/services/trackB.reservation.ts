// Track B: EMR/CRM 연동 및 알림톡 발송

export interface ReservationPayload {
  patientName: string
  patientPhone: string
  department: string
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  memo?: string
}

export interface ReservationResult {
  success: boolean
  reservationId?: string
  message: string
}

// EMR API 호출 (HIS 시스템 연동)
async function callEMR(endpoint: string, body: object): Promise<Response> {
  const emrUrl = process.env.EMR_API_URL
  const emrKey = process.env.EMR_API_KEY
  if (!emrUrl || !emrKey) throw new Error('EMR 연동 설정이 없습니다.')

  return fetch(`${emrUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': emrKey,
    },
    body: JSON.stringify(body),
  })
}

// 카카오 알림톡 발송
async function sendAlimtalk(phone: string, templateCode: string, variables: Record<string, string>) {
  const kakaoKey = process.env.KAKAO_ALIMTALK_KEY
  const senderKey = process.env.KAKAO_SENDER_KEY
  if (!kakaoKey || !senderKey) return

  await fetch('https://alimtalk.kakao.com/v2/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${kakaoKey}`,
    },
    body: JSON.stringify({
      senderKey,
      templateCode,
      to: phone,
      variables,
    }),
  }).catch(() => {})
}

export async function createReservation(payload: ReservationPayload): Promise<ReservationResult> {
  try {
    const res = await callEMR('/reservations', payload)
    if (!res.ok) throw new Error(`EMR API ${res.status}`)

    const data = await res.json()
    const reservationId = data.reservationId as string

    await sendAlimtalk(payload.patientPhone, 'RESERVATION_CONFIRM', {
      name: payload.patientName,
      department: payload.department,
      date: payload.date,
      time: payload.time,
    })

    return { success: true, reservationId, message: `예약이 완료되었습니다. (예약번호: ${reservationId})` }
  } catch (err: any) {
    return { success: false, message: `예약 처리 중 오류가 발생했습니다: ${err.message}` }
  }
}

export async function cancelReservation(reservationId: string, phone: string): Promise<ReservationResult> {
  try {
    const res = await callEMR('/reservations/cancel', { reservationId })
    if (!res.ok) throw new Error(`EMR API ${res.status}`)

    await sendAlimtalk(phone, 'RESERVATION_CANCEL', { reservationId })

    return { success: true, message: `예약(${reservationId})이 취소되었습니다.` }
  } catch (err: any) {
    return { success: false, message: `취소 처리 중 오류가 발생했습니다: ${err.message}` }
  }
}

export async function getReservation(patientPhone: string): Promise<ReservationResult & { reservations?: object[] }> {
  try {
    const res = await callEMR('/reservations/inquiry', { phone: patientPhone })
    if (!res.ok) throw new Error(`EMR API ${res.status}`)

    const data = await res.json()
    return { success: true, message: '예약 조회 완료', reservations: data.reservations }
  } catch (err: any) {
    return { success: false, message: `조회 중 오류가 발생했습니다: ${err.message}` }
  }
}
