// File: src/services/openaiService.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';
import {LLMAnalysis} from "../types";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY не задано в .env');
}

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeWithOpenAI(
    description: string,
    decision: string,
    considerations: string[]
): Promise<LLMAnalysis> {
    const model = process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo';

    const messages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content:
                `You are an assistant that analyzes user decisions and always responds in the same language as the user input; analyze the following and return only JSON with keys decisionCategory ( “emotional”, “strategic”, “impulsive” e.g..., you can add another one on your by our mind), cognitiveBiases (must contain at least one bias), and missingAlternatives (list of overlooked alternatives with brief explanations).`
        },
        {
            role: 'user',
            content: `Situation: ${description}
            Decision: ${decision}
            Considerations: ${considerations.join(', ')}

            return only  JSON:
            {"decisionCategory": string, "cognitiveBiases": string[], "missingAlternatives": string[]}`
        }
    ];

    const resp = await openaiClient.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 256
    });


    const text = resp.choices[0].message?.content;
    if (!text) throw new Error('Empty response from OpenAI');

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Не вдалося знайти JSON у відповіді OpenAI');

    const parsed = JSON.parse(match[0]) as Partial<LLMAnalysis>;
    return {
        decisionCategory: parsed.decisionCategory || '',
        cognitiveBiases: parsed.cognitiveBiases || [],
        missingAlternatives: parsed.missingAlternatives || [],
    };
}