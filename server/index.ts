import { sanitizeInput } from './middlewares/sanitization'
import { checkRateLimit } from './middlewares/rateLimiter'
import { fastRoute } from './classifiers/fastRouter'
import { classifyWithLLM } from './classifiers/llmClassifier'
import { matchRules } from './utils/rules'
import { buildTextResponse } from './utils/response'
import type { BotResponse } from './utils/response'
import { handleChitchat } from './services/trackD.chitchat'
import { loadGuideFile } from './utils/guide-loader'
import { getTenantConfig } from '@/utils/tenant.utils'
import type { Suggestion } from '@/types/tenant.type'

interface PipelineInput {
  message: string
  userId: string
  buttonPayload?: string
  tenantKey?: string
}

export interface PipelineResult {
  response: BotResponse
  suggestions?: Suggestion[]
  link?: string
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const { message, userId, tenantKey } = input
  const tenant = getTenantConfig(tenantKey)

  const rateResult = checkRateLimit(userId)
  if (!rateResult.allowed) {
    return { response: buildTextResponse('잠시 후 다시 시도해 주세요. (요청 한도 초과)') }
  }

  const sanitized = sanitizeInput(message)
  if (!sanitized.safe) {
    return { response: buildTextResponse(sanitized.reason ?? '올바른 내용을 입력해 주세요.') }
  }

  const cleanMessage = sanitized.sanitized

  const trackARules = tenant.rules.find(r => r.trackA)?.trackA ?? []
  const trackCRules = tenant.rules.find(r => r.trackC)?.trackC ?? []
  let intent = fastRoute(cleanMessage, trackARules, trackCRules)

  if (!intent.matched) {
    const llmResult = await classifyWithLLM(cleanMessage)
    intent = { matched: true, intent: llmResult.intent, confidence: llmResult.confidence }
  }

  console.log(`[pipeline] "${cleanMessage}" → ${intent.intent} (${intent.confidence})`)

  switch (intent.intent) {
    case 'TRACK_A': {
      const trackAFallback = tenant.fallback.find(r => r.trackA)?.trackA ?? ''
      const { text, link, suggestions } = matchRules(cleanMessage, trackARules, trackAFallback)
      return { response: buildTextResponse(text), suggestions, link }
    }

    case 'TRACK_C': {
      const trackCFallback = tenant.fallback.find(r => r.trackC)?.trackC ?? ''
      const { text, link, suggestions } = matchRules(cleanMessage, trackCRules, trackCFallback)
      return { response: buildTextResponse(text), suggestions, link }
    }

    case 'TRACK_D':
    default: {
      const guide = tenant.guide ?? {}
      const [profile, rules] = await Promise.all([
        guide.profile ? loadGuideFile(guide.profile) : Promise.resolve(''),
        guide.rules   ? loadGuideFile(guide.rules)   : Promise.resolve(''),
      ])
      const systemContext = [profile, rules].filter(Boolean).join('\n\n')
      const response = await handleChitchat(cleanMessage, systemContext)
      return { response }
    }
  }
}
