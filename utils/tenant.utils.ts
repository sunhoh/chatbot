import { luho } from '@/configs/tenant.config'
import type { TenantConfig } from '../types/tenant.type'

export const DEFAULT_TENANT_KEY = 'luho'

const TENANT_CONFIGS: Record<string, TenantConfig> = {
  [luho.tenantKey]: luho,
}

export function getTenantConfig(tenantKey = DEFAULT_TENANT_KEY) {
  return TENANT_CONFIGS[tenantKey] ?? TENANT_CONFIGS[DEFAULT_TENANT_KEY]
}

export type { TenantConfig, TenantTheme, TenantPosition, FaqRule, TrackRules, TrackFallbacks } from '../types/tenant.type'
