const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://openrouter.ai/api/v1';

export interface AnalysisResult {
  summary: string;
  insights: string[];
}

export async function analyzeNote(content: string): Promise<AnalysisResult> {
  const prompt = `You are an AI assistant tasked with analyzing a note. Provide a concise summary (2-3 sentences) and extract 3-5 key insights as bullet points. Return a JSON object with keys \"summary\" and \"insights\" (array of strings). Do not include any additional text.`;

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `${prompt}\n\nNote:\n${content}` },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content?.trim();
  if (!message) {
    throw new Error('Empty response from OpenAI');
  }
  // Strip markdown code fences if the model wraps JSON in ```json ... ```
  const cleaned = message.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: String(parsed.summary ?? ''),
      insights: Array.isArray(parsed.insights) ? parsed.insights.map(String) : [],
    };
  } catch (e) {
    throw new Error(`Could not parse OpenAI response as JSON: ${cleaned.slice(0, 200)}`);
  }
}
