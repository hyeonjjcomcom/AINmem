import ChatLog from '@/models/chatLogs';
import connectDB from '@/lib/mongodb';

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
 * LLM API를 호출하여 입력 텍스트의 카테고리를 분류합니다.
 * Fire-and-forget 패턴으로 사용됩니다.
 */
export async function classifyAndUpdateTags(documentId: string, inputText: string): Promise<void> {
  try {
    await connectDB();

    const prompt = PROMPT_TEMPLATE.replace('{userInput}', inputText);

    const llmApiUrl = process.env.LLM_API_URL;
    const llmModel = process.env.LLM_MODEL;

    if (!llmApiUrl || !llmModel) {
      console.error('❌ LLM_API_URL or LLM_MODEL not configured in .env');
      return;
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
        max_tokens: 32
      })
    });

    if (!response.ok) {
      console.error('❌ LLM API error:', response.status, response.statusText);
      return;
    }

    const result = await response.json();
    const category = result.choices?.[0]?.message?.content?.trim();

    if (!category) {
      console.error('❌ No category returned from LLM');
      return;
    }

    // 유효한 카테고리인지 확인
    const validCategory = VALID_CATEGORIES.find(
      c => c.toLowerCase() === category.toLowerCase()
    );

    if (!validCategory) {
      console.warn('⚠️ Invalid category from LLM:', category);
      return;
    }

    // tags 배열에 카테고리 추가 (중복 방지)
    await ChatLog.findByIdAndUpdate(
      documentId,
      { $addToSet: { tags: validCategory } }
    );

    console.log(`✅ Tag "${validCategory}" added to document ${documentId}`);
  } catch (error) {
    console.error('❌ Error classifying tags:', error);
  }
}
