import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // 간단한 응답 로직 (실제로는 AI API나 더 복잡한 로직을 사용할 수 있습니다)
    const replies = [
      '흥미로운 질문이네요! 더 자세히 말씀해 주시겠어요?',
      '네, 이해했습니다. 어떤 부분이 가장 궁금하신가요?',
      '좋은 생각이에요! 그것에 대해 더 이야기해 볼까요?',
      '알겠습니다. 다른 도움이 필요하신가요?',
      '그렇군요. 더 구체적으로 설명해 주실 수 있나요?',
    ]

    // 메시지 길이에 따라 다른 응답
    let reply = ''
    if (message.toLowerCase().includes('안녕')) {
      reply = '안녕하세요! 오늘은 어떻게 도와드릴까요?'
    } else if (message.toLowerCase().includes('도움')) {
      reply = '네, 기꺼이 도와드리겠습니다! 무엇이 필요하신가요?'
    } else if (message.toLowerCase().includes('감사')) {
      reply = '천만에요! 도움이 되었다니 기쁩니다.'
    } else {
      reply = replies[Math.floor(Math.random() * replies.length)]
    }

    // 약간의 지연을 추가하여 더 자연스럽게
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}