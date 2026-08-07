export type TenantPosition = 'left' | 'right'

export type Suggestion =
  | { label: string; type: 'message'; text: string }
  | { label: string; type: 'link'; url: string }
  | { label: string; type: 'phone'; number: string }

export interface FaqRule {
  pattern: RegExp
  response?: string
  link?: string
  suggestions?: Suggestion[]
}

export interface TenantTheme {
  primaryColor: string
  backgroundColor: string
  botName: string
  logoUrl?: string
  logoFallback: string
  position: TenantPosition
  width: string
  height: string
  placeholder: string
  suggestedQuestions: string[]
}

export interface TrackRules {
  trackA?: FaqRule[]
  trackC?: FaqRule[]
}

export interface TrackFallbacks {
  trackA?: string
  trackC?: string
}

export interface TenantConfig {
  tenantKey: string
  displayName: string
  welcomeMessage: string
  theme: TenantTheme
  rules: TrackRules[]
  fallback: TrackFallbacks[]
  guide?: {
    [key:string]: string
  }
}
