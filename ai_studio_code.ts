import type { FortuneType } from '../../types';

async function callApi(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    // پرتاب خطا با جزئیات برای مدیریت بهتر در UI
    throw new Error(errorBody.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  // بررسی اینکه آیا پاسخی از Gemini آمده یا به دلیل فیلتر ایمنی خالی است
  if (!data.text) {
      throw new Error("EMPTY_RESPONSE");
  }
  return data.text;
}

export async function generateFortune(type: FortuneType, options?: { month?: string; gender?: string; }): Promise<string> {
  let finalPrompt = type.prompt;

  if (options?.month) {
    finalPrompt = finalPrompt.replace(/{month}/g, options.month);
  }
  if (options?.gender) {
    finalPrompt = finalPrompt.replace('{gender}', options.gender);
  }

  return callApi(finalPrompt);
}

export async function generateAboutText(): Promise<string> {
    const { ABOUT_US_PROMPT } = await import('../../constants');
    return callApi(ABOUT_US_PROMPT);
}