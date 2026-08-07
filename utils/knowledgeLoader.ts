export async function loadKnowledgeBase(): Promise<string> {
  throw new Error('Knowledge base files are server-only. Load them through tenant config.');
}

export async function loadRules(): Promise<string> {
  throw new Error('Rule files are server-only. Load them through tenant config.');
}

export function createSystemInstruction(knowledgeBase: string, rules: string): string {
  return `
  ${rules}
  --- 고객센터 FAQ ---
${knowledgeBase}
---`;
}
