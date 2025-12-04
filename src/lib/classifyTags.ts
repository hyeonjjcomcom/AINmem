import ChatLog from '@/models/chatLogs';
import ClassificationLog from '@/models/classificationLog';
import connectDB from '@/lib/mongodb';
import type { ClassificationAttempt } from '@/models/classificationLog';

const PROMPT_TEMPLATE = `
Given a user input, identify the single category that best matches the input from the list below.
Output ONLY the category name. Do not output any other text.

Categories: Exploration, Inspiration, Refinement, Solution, Empathy, Play, Others

Exploration: Knowledge Acquisition & Learning. This category covers requests for information, learning new fields, or understanding complex concepts.
Examples: Explaining quantum mechanics simply, summarizing historical facts, or comparing product specifications (e.g., iPhone vs. Galaxy).

Inspiration: Creativity & Writing Assistance. This category involves content creation, brainstorming, and drafting. It addresses requests for generating new ideas or overcoming writer's block.
Examples: Drafting a polite refusal email, brainstorming marketing catchphrases, or creating a synopsis for a novel.

Refinement: Language Processing & Summarization. This category focuses on processing existing text for efficiency or clarity. It includes translation, summarization, and tone adjustment.
Examples: Translating a sentence into business English, summarizing a long news article, or rewriting a formal report into a casual blog style.

Solution: Technical Problem Solving. This category addresses requests for concrete, logical, or mathematical solutions, often from developers or students.
Examples: Debugging code, explaining Excel functions, or solving mathematical/scientific problems step-by-step.

Empathy: Advice & Emotional Interaction. This category covers requests for personal advice, emotional support, daily decision-making assistance, or conversational roleplay.
Examples: Recommending dinner menus or gifts, offering consolation for a bad day, or conducting mock interview roleplays.

Play: Purposeless Interaction & Nonsense. This category includes inputs with no clear context, intended for amusement, testing reactions, or simple play.
Examples: Random character strings (e.g., "aaaaa"), sending a single emoji without context, playful insults, or nonsense phrases.

Others: Inputs that cannot be classified into any of the above categories.

User Input: {userInput}
`;

const VALID_CATEGORIES = [
  'Exploration',
  'Inspiration',
  'Refinement',
  'Solution',
  'Empathy',
  'Play',
  'Others'
];

/**
 * LLM API를 호출하여 카테고리를 분류합니다.
 * @returns ClassificationAttempt 객체
 */
async function callLLMForClassification(
  prompt: string,
  attemptNumber: number
): Promise<ClassificationAttempt> {
  const llmApiUrl = process.env.LLM_API_URL;
  const llmModel = process.env.LLM_MODEL || 'unknown';
  const maxTokens = 32;

  const attempt: ClassificationAttempt = {
    attemptNumber,
    llmRequest: {
      model: llmModel,
      prompt,
      maxTokens
    },
    isValid: false,
    timestamp: new Date()
  };

  try {
    if (!llmApiUrl) {
      throw new Error('LLM_API_URL not configured in .env');
    }

    const response = await fetch(llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    attempt.llmResponse = result;

    const category = result.choices?.[0]?.message?.content?.trim();
    attempt.extractedCategory = category;

    if (!category) {
      attempt.error = 'No category returned from LLM';
      return attempt;
    }

    // 유효한 카테고리인지 확인
    const validCategory = VALID_CATEGORIES.find(
      c => c.toLowerCase() === category.toLowerCase()
    );

    if (validCategory) {
      attempt.isValid = true;
      attempt.extractedCategory = validCategory;
    } else {
      attempt.error = `Invalid category: ${category}`;
    }

    return attempt;
  } catch (error) {
    attempt.error = error instanceof Error ? error.message : String(error);
    return attempt;
  }
}

/**
 * LLM API를 호출하여 입력 텍스트의 카테고리를 분류합니다.
 * Fire-and-forget 패턴으로 사용됩니다.
 * 실패 시 1회 재시도하며, 모든 과정을 ClassificationLog에 기록합니다.
 */
export async function classifyAndUpdateTags(documentId: string, inputText: string): Promise<void> {
  const attempts: ClassificationAttempt[] = [];
  let finalCategory: string | undefined;
  let status: 'success' | 'failed' | 'partial' = 'failed';

  try {
    await connectDB();

    const prompt = PROMPT_TEMPLATE.replace('{userInput}', inputText);

    // 1차 시도
    const attempt1 = await callLLMForClassification(prompt, 1);
    attempts.push(attempt1);

    if (attempt1.isValid && attempt1.extractedCategory) {
      finalCategory = attempt1.extractedCategory;
      status = 'success';
    } else {
      // 실패 시 1회 재시도
      console.log('🔄 Retrying LLM classification...');
      const attempt2 = await callLLMForClassification(prompt, 2);
      attempts.push(attempt2);

      if (attempt2.isValid && attempt2.extractedCategory) {
        finalCategory = attempt2.extractedCategory;
        status = 'partial'; // 재시도 후 성공
      }
    }

    // ClassificationLog에 기록
    await ClassificationLog.create({
      documentId,
      inputText,
      attempts,
      finalCategory,
      status
    });

    // 성공한 경우 tags 배열에 카테고리 추가
    if (finalCategory) {
      await ChatLog.findByIdAndUpdate(
        documentId,
        { $addToSet: { tags: finalCategory } }
      );
      console.log(`✅ Tag "${finalCategory}" added to document ${documentId}`);
    } else {
      console.error(`❌ Failed to classify document ${documentId} after ${attempts.length} attempts`);
    }
  } catch (error) {
    console.error('❌ Error classifying tags:', error);

    // 에러 발생 시에도 로그 기록 시도
    try {
      await ClassificationLog.create({
        documentId,
        inputText,
        attempts: attempts.length > 0 ? attempts : [{
          attemptNumber: 1,
          llmRequest: {
            model: 'unknown',
            prompt: '',
            maxTokens: 32
          },
          isValid: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        }],
        status: 'failed'
      });
    } catch (logError) {
      console.error('❌ Failed to save classification log:', logError);
    }
  }
}
