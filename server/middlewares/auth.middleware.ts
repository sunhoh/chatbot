import { NextRequest, NextResponse } from 'next/server'

export interface AuthResult {
  valid: boolean
  userId?: string
  error?: string
}

// 본인인증 CI 토큰 검증
export function verifyCI(token: string): AuthResult {
  if (!token) {
    return { valid: false, error: '인증 토큰이 없습니다.' }
  }

  // CI 토큰 형식 검증 (Base64 인코딩된 88자)
  const ciPattern = /^[A-Za-z0-9+/]{86}==$/
  if (!ciPattern.test(token)) {
    return { valid: false, error: '유효하지 않은 CI 토큰 형식입니다.' }
  }

  return { valid: true, userId: token.slice(0, 16) }
}

export function withAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') ?? ''

    const result = verifyCI(token)
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return handler(req, result.userId!)
  }
}
