import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { hybridSearchListingsQuery } from '@/modules/listings/queries';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // ── 1. Extract budget & metadata via structured output ───────────────────
    const extractFiltersSchema = {
      type: Type.OBJECT,
      properties: {
        max_budget: {
          type: Type.NUMBER,
          description: 'The maximum budget the user is looking for. Null if not specified.',
        },
        min_ram_gb: {
          type: Type.NUMBER,
          description: 'The minimum amount of RAM in GB requested (e.g., 8, 16, 32). Null if not specified.',
        },
        requires_gaming: {
          type: Type.BOOLEAN,
          description: 'Set to true ONLY if the user explicitly asks for a gaming laptop. Null otherwise.',
        },
        // preferred_use_case: {
        //   type: Type.STRING,
        //   description: "A single primary use case the user mentioned, such as 'business', 'programming', or 'student'. Null if not specified.",
        // },
        // expected_audience: {
        //   type: Type.STRING,
        //   description: "The specific type of user this is for, such as 'business professionals' or 'designers'. Null if not specified.",
        // }
      },
    };

    const extractFiltersResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        responseMimeType: 'application/json',
        responseSchema: extractFiltersSchema,
      },
    });

    let max_budget = 999999;
    let min_ram_gb = null;
    let requires_gaming = null;
    // let preferred_use_case = null;
    // let expected_audience = null;

    try {
      const parsed = JSON.parse(extractFiltersResponse.text || '{}');
      if (typeof parsed.max_budget === 'number') max_budget = parsed.max_budget;
      if (typeof parsed.min_ram_gb === 'number') min_ram_gb = parsed.min_ram_gb;
      if (typeof parsed.requires_gaming === 'boolean') requires_gaming = parsed.requires_gaming;
      // if (typeof parsed.preferred_use_case === 'string') preferred_use_case = parsed.preferred_use_case;
      // if (typeof parsed.expected_audience === 'string') expected_audience = parsed.expected_audience;
    } catch (e) {
      console.error('Failed to parse filter JSON', e);
    }

    // --- ADD THIS CLEANUP CODE HERE ---
    // 1. Fix negative budgets
    if (max_budget <= 0) max_budget = 999999;

    // 2. Fix negative RAM
    if (min_ram_gb !== null && min_ram_gb <= 0) min_ram_gb = null;

    // 3. Fix literal string "null" or empty strings
    // if (preferred_use_case === "null" || preferred_use_case === "" || preferred_use_case === "Null" || preferred_use_case === "NULL") preferred_use_case = null;
    // if (expected_audience === "null" || expected_audience === "" || expected_audience === "Null" || expected_audience === "NULL") expected_audience = null;
    // ----------------------------------

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
    // NOTE: We are passing an object here now so it's easier to manage the new variables!
    const listings = await hybridSearchListingsQuery({
      query_embedding: Array.from(query_embedding),
      max_price: max_budget,
      min_ram_gb,
      requires_gaming,
      // preferred_use_case,
      // expected_audience,
      match_limit: 5
    });


    // ── 4. Build context string for the LLM ─────────────────────────────────
    // We MUST include the listing_id in the context so the AI knows how to identify them
    const contextStr =
      listings.length > 0
        ? JSON.stringify(
          listings.map((l) => ({
            listing_id: l.listing_id, // Added ID
            title: l.title,
            price: l.price,
            currency: l.currency ?? 'ILS',
          }))
        )
        : 'No suitable listings found.';

    const prompt = `User's message: "${message}"\n\nDatabase search results:\n${contextStr}\n\nRespond conversationally to the user based on the results. If results are found, mention them briefly. If some of the database results do not accurately match the user's intent, IGNORE them completely.`;

    // ── 5. Generate conversational reply AND filter the UI ──────────────────
    // Force the AI to output exactly which IDs it wants to display
    const finalResponseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: "Your conversational text response to the user."
        },
        relevant_listing_ids: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of listing_ids from the database results that ACTUALLY match the user's request. Exclude bad matches."
        }
      }
    };

    const chatReplyResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: finalResponseSchema,
      }
    });

    let reply = 'Here is what I found.';
    let finalListings = listings; // Default to all listings just in case

    try {
      const parsedReply = JSON.parse(chatReplyResponse.text || '{}');

      if (parsedReply.reply) {
        reply = parsedReply.reply;
      }

      // Intercept and filter the UI data based on the AI's strict decision!
      if (parsedReply.relevant_listing_ids && Array.isArray(parsedReply.relevant_listing_ids)) {
        finalListings = listings.filter((l) =>
          parsedReply.relevant_listing_ids.includes(l.listing_id)
        );
      }
    } catch (e) {
      console.error('Failed to parse final AI JSON response', e);
    }

    // Return the filtered list to the frontend!
    return NextResponse.json({ reply, listings: finalListings });
  } catch (error: unknown) {
    console.error('API Error in /api/chat:', error);
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}