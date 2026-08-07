export interface BotResponse {
  version: string
  template: {
    outputs: BotOutput[]
    quickReplies?: QuickReply[]
  }
}

export interface BotOutput {
  simpleText?: { text: string }
  basicCard?: {
    title: string
    description: string
    buttons?: BotButton[]
  }
  listCard?: {
    header: { title: string }
    items: Array<{ title: string; description: string; imageUrl?: string }>
    buttons?: BotButton[]
  }
}

export interface BotButton {
  label: string
  action: 'message' | 'webLink' | 'block' | 'phone'
  messageText?: string
  webLinkUrl?: string
  blockId?: string
  phoneNumber?: string
}

export interface QuickReply {
  label: string
  action: 'message' | 'block'
  messageText?: string
  blockId?: string
}

export function buildTextResponse(text: string, quickReplies?: QuickReply[]): BotResponse {
  return {
    version: '2.0',
    template: {
      outputs: [{ simpleText: { text } }],
      quickReplies,
    },
  }
}

export function buildCardResponse(
  title: string,
  description: string,
  buttons?: BotButton[],
  quickReplies?: QuickReply[]
): BotResponse {
  return {
    version: '2.0',
    template: {
      outputs: [{ basicCard: { title, description, buttons } }],
      quickReplies,
    },
  }
}

export const MAIN_MENU_REPLIES: QuickReply[] = [
  { label: '예약하기',      action: 'message', messageText: '예약하고 싶어요' },
  { label: '예약조회',      action: 'message', messageText: '예약 조회해주세요' },
  { label: '예약취소',      action: 'message', messageText: '예약 취소하고 싶어요' },
  { label: '자주 묻는 질문', action: 'message', messageText: 'FAQ' },
]
