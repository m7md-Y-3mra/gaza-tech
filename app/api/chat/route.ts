import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { hybridSearchListingsQuery } from '@/modules/listings/queries';
import { categories, ProductCondition } from '@/modules/listings/types';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY2;
    console.log(geminiApiKey);
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
          description:
            'The maximum budget the user is looking for. Null if not specified.',
        },
        min_ram_gb: {
          type: Type.NUMBER,
          description:
            'The minimum amount of RAM in GB requested (e.g., 8, 16, 32). Null if not specified.',
        },
        requires_gaming: {
          type: Type.STRING,
          description:
            "Output 'true' if the user explicitly asks for a gaming laptop. Output 'false' if they explicitly say 'NOT for gaming'. Output 'unspecified' if gaming is not mentioned at all.",
        },
        target_location: {
          type: Type.STRING,
          description:
            'The city or region name the user wants to search in. Output any if none match or not specified.',
          enum: [
            'Gaza City',
            'Khan Yunis',
            'Deir Al Balah',
            'Nuseirat Camp',
            'Bureij Camp',
            'Zawaida Camp',
            'Maghazi Camp',
            'Jabalia',
            'Beit Lahia',
            'Rafah',
            'Beit Hanoun',
            'Beach Camp',
            'any',
          ],
        },
        target_seller: {
          type: Type.STRING,
          description:
            'The seller name the user is looking for. Null if not mentioned.',
        },
        target_category: {
          type: Type.STRING,
          description:
            "The product category. Output 'any' if none match or not specified.",
          enum: ['any', ...categories],
        },
        target_condition: {
          type: Type.STRING,
          description:
            "The item condition. Output 'any' if the user doesn't specify.",
          enum: ['any', ...Object.keys(ProductCondition)],
        },
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
    let target_location: string | null = null;
    let target_seller: string | null = null;
    let target_category: string | null = null;
    let target_condition: string | null = null;

    try {
      const parsed = JSON.parse(extractFiltersResponse.text || '{}');
      if (typeof parsed.max_budget === 'number') max_budget = parsed.max_budget;
      if (typeof parsed.min_ram_gb === 'number') min_ram_gb = parsed.min_ram_gb;
      if (parsed.requires_gaming === 'true') requires_gaming = true;
      if (parsed.requires_gaming === 'false') requires_gaming = false;
      if (typeof parsed.target_location === 'string')
        target_location = parsed.target_location;
      if (typeof parsed.target_seller === 'string')
        target_seller = parsed.target_seller;
      if (
        typeof parsed.target_category === 'string' &&
        parsed.target_category !== 'null' &&
        parsed.target_category !== ''
      )
        target_category = parsed.target_category;
      if (
        typeof parsed.target_condition === 'string' &&
        parsed.target_condition !== 'null' &&
        parsed.target_condition !== ''
      )
        target_condition = parsed.target_condition;
    } catch (e) {
      console.error('Failed to parse filter JSON', e);
    }

    // --- ADD THIS CLEANUP CODE HERE ---
    // 1. Fix negative budgets
    if (max_budget <= 0) max_budget = 999999;

    // 2. Fix negative RAM
    if (min_ram_gb !== null && min_ram_gb <= 0) min_ram_gb = null;

    // 3. Fix literal string "null" or empty strings
    if (
      !target_location ||
      target_location.toLowerCase() === 'null' ||
      target_location.toLowerCase() === 'any'
    )
      target_location = null;
    if (
      !target_seller ||
      target_seller.toLowerCase() === 'null' ||
      target_seller.toLowerCase() === 'any'
    )
      target_seller = null;
    if (
      !target_category ||
      target_category.toLowerCase() === 'null' ||
      target_category.toLowerCase() === 'any'
    )
      target_category = null;
    if (
      !target_condition ||
      target_condition.toLowerCase() === 'null' ||
      target_condition.toLowerCase() === 'any'
    )
      target_condition = null;
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
      target_location,
      target_seller,
      target_category,
      target_condition,
      match_limit: 5,
    });

    console.log(listings);

    // ── 4. Build context string for the LLM ─────────────────────────────────
    // We MUST include the listing_id in the context so the AI knows how to identify them
    const contextStr =
      listings.length > 0
        ? JSON.stringify(
            listings.map((l) => ({
              listing_id: l.listing_id,
              title: l.title,
              price: l.price,
              specifications: l.specifications,
              condition: l.product_condition, // AI can see the condition!
              category: l.category, // AI can see the category!
              location: l.location,
              seller: l.sellerName,
              currency: l.currency ?? 'ILS',
            }))
          )
        : 'No suitable listings found.';

    const prompt = `User's message: "${message}"\n\nDatabase search results:\n${contextStr}\n\nRespond conversationally to the user based on the results. If some results do not accurately match the user's intent, IGNORE them completely. CRITICAL: If you mention or recommend an item in your text reply, you MUST include its exact listing_id in the relevant_listing_ids array.`;

    // ── 5. Generate conversational reply AND filter the UI ──────────────────
    // Force the AI to output exactly which IDs it wants to display
    const finalResponseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: 'Your conversational text response to the user.',
        },
        relevant_listing_ids: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "An array of listing_ids from the database results that ACTUALLY match the user's request. Exclude bad matches.",
        },
      },
    };

    const chatReplyResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: finalResponseSchema,
      },
    });

    let reply = 'Here is what I found.';
    let finalListings = listings; // Default to all listings just in case

    try {
      const parsedReply = JSON.parse(chatReplyResponse.text || '{}');

      if (parsedReply.reply) {
        reply = parsedReply.reply;
      }

      // Intercept and filter the UI data based on the AI's strict decision!
      if (
        parsedReply.relevant_listing_ids &&
        Array.isArray(parsedReply.relevant_listing_ids)
      ) {
        const filtered = listings.filter((l) =>
          parsedReply.relevant_listing_ids.includes(l.listing_id)
        );

        // Safety Fallback: Only apply the filter if it found matches,
        // OR if the AI explicitly returned an empty array (meaning no matches).
        // This prevents the UI from going blank if the AI recommends an item but forgets the ID.
        if (
          filtered.length > 0 ||
          parsedReply.relevant_listing_ids.length === 0
        ) {
          finalListings = filtered;
        }
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
