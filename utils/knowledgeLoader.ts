export async function loadKnowledgeBase(): Promise<string> {
  try {
    const files = ['/faq.md'];
    const responses = await Promise.all(files.map(file => fetch(file)));

    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Failed to load knowledge base file: ${response.statusText}`);
      }
    }

    const texts = await Promise.all(responses.map(res => res.text()));
    return texts.join('\n\n---\n\n');
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    throw error;
  }
}

export async function loadRules(): Promise<string> {
  try {
    const file = '/rules.md';
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load rules file: ${response.statusText}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error loading rules:', error);
    throw error;
  }
}

export function createSystemInstruction(knowledgeBase: string, rules: string): string {
  return `
  ${rules}
  --- 고객센터 FAQ ---
${knowledgeBase}
---`;
}
