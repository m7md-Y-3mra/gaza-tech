import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { hybridSearchListingsQuery } from '@/modules/listings/queries';

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not configured.' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        // ── 1. Extract max budget via structured output ──────────────────────────
        const extractBudgetSchema = {
            type: Type.OBJECT,
            properties: {
                max_budget: {
                    type: Type.NUMBER,
                    description:
                        'The maximum budget the user is looking for. Null if not specified.',
                },
            },
        };

        const extractBudgetResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                responseMimeType: 'application/json',
                responseSchema: extractBudgetSchema,
            },
        });

        let max_budget = 999999;
        try {
            const parsed = JSON.parse(extractBudgetResponse.text || '{}');
            if (parsed.max_budget && typeof parsed.max_budget === 'number') {
                max_budget = parsed.max_budget;
            }
        } catch (e) {
            console.error('Failed to parse budget JSON', e);
        }

        // ── 2. Generate query vector ─────────────────────────────────────────────
        const embeddingResponse = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: message,
            config: { outputDimensionality: 768 },
        });

        const query_embedding = embeddingResponse.embeddings?.[0]?.values;
        if (!query_embedding || query_embedding.length === 0) {
            return NextResponse.json(
                { error: 'Failed to generate embedding' },
                { status: 500 }
            );
        }

        // ── 3. Hybrid search – returns ListingCardItem[] ─────────────────────────
        const listings = await hybridSearchListingsQuery(
            Array.from(query_embedding),
            max_budget,
            5
        );

        // ── 4. Build context string for the LLM ─────────────────────────────────
        const contextStr =
            listings.length > 0
                ? JSON.stringify(
                    listings.map((l) => ({
                        title: l.title,
                        price: l.price,
                        currency: l.currency ?? 'ILS',
                    }))
                )
                : 'No suitable listings found.';

        const prompt = `User's message: "${message}"\n\nDatabase search results:\n${contextStr}\n\nRespond conversationally to the user based on the results. If results are found, mention them briefly. If no results are found, apologize. Keep it helpful and concise.`;

        // ── 5. Generate conversational reply ────────────────────────────────────
        const chatReplyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const reply = chatReplyResponse.text || 'Here is what I found.';

        return NextResponse.json({ reply, listings });
    } catch (error: unknown) {
        console.error('API Error in /api/chat:', error);
        const message =
            error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
