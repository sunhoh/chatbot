import type { FaqRule, Suggestion } from '@/types/tenant.type'

export function matchRules(
  message: string,
  rules: FaqRule[],
  fallback: string,
): { text: string; link?: string; suggestions?: Suggestion[] } {
  for (const rule of rules) {
    if (rule.pattern.test(message))
      return { text: rule.response ?? fallback, link: rule.link, suggestions: rule.suggestions }
  }
  return { text: fallback }
}
