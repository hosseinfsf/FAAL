import type { FortuneType } from '../../types';

async function callApi(prompt: string): Promise<string> {
  if (!prompt?.trim()) {
    throw new Error('پرامپت نمی‌تواند خالی باشد');
  }

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.text?.trim()) {
    throw new Error('پاسخی از مدل دریافت نشد. احتمالاً به دلیل فیلتر ایمنی Gemini.');
  }

  return data.text.trim();
}

export async function generateFortune(
  type: FortuneType,
  options?: { month?: string; gender?: string }
): Promise<string> {
  if (!type?.prompt) {
    throw new Error('نوع فال معتبر نیست یا پرامپت ندارد');
  }

  let finalPrompt = type.prompt;

  if (options?.month) {
    finalPrompt = finalPrompt.replace(/{month}/g, options.month);
  }
  if (options?.gender) {
    finalPrompt = finalPrompt.replace(/{gender}/g, options.gender);
  }

  return callApi(finalPrompt);
}

export async function generateAboutText(): Promise<string> {
  try {
    const { ABOUT_US_PROMPT } = await import('../../constants');
    if (!ABOUT_US_PROMPT?.trim()) {
      throw new Error('متن درباره ما تعریف نشده است');
    }
    return callApi(ABOUT_US_PROMPT);
  } catch (error) {
    console.error('Failed to generate about text:', error);
    throw new Error('خطا در بارگذاری متن درباره ما');
  }
}