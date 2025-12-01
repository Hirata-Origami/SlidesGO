import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 5;

export async function POST(req: Request) {
    try {
        // Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const lastRequestTime = rateLimitMap.get(ip) || 0;

        if (now - lastRequestTime < (RATE_LIMIT_WINDOW / MAX_REQUESTS)) {
            return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
        }
        rateLimitMap.set(ip, now);

        const { topic, slideCount = 5, apiKey: providedKey } = await req.json();

        // 1. Try provided key first
        let geminiKey = providedKey;

        // 2. If no key, try fetching from Supabase using the Auth header
        if (!geminiKey) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader) {
                const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                    global: { headers: { Authorization: authHeader } }
                });

                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('user_api_keys')
                        .select('gemini_api_key')
                        .eq('user_id', user.id)
                        .single();

                    if (data?.gemini_api_key) {
                        geminiKey = data.gemini_api_key;
                    }
                }
            }
        }

        if (!geminiKey) {
            return NextResponse.json({ error: 'Gemini API Key not found. Please configure it in Settings.' }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `Generate a presentation outline for the topic: "${topic}".
    Create exactly ${slideCount} slides.
    
    The slides MUST follow this structure:
    1. Slide 1: Layout "Title" (Introduction)
    2. Slide 2: Layout "Agenda" (List of topics)
    3. Slides 3 to ${slideCount - 1}: Mix of layouts "Content", "TwoColumn", "ImageLeft", "ImageRight", "Quote".
    4. Slide ${slideCount}: Layout "Conclusion" (Summary/Thank you)

    Return ONLY a valid JSON array of objects.
    Each object should have:
    - "title": string
    - "content": string (bullet points or short paragraph)
    - "imagePrompt": string (A highly detailed, artistic, photorealistic description for an AI image generator. Describe lighting, style, and mood. NO text in image.)
    - "layout": string (One of: "Title", "Agenda", "Content", "TwoColumn", "ImageLeft", "ImageRight", "Quote", "Conclusion")
    
    Example format:
    [
      {
        "title": "The Future of AI",
        "content": "Exploring the next generation...",
        "imagePrompt": "Futuristic cityscape with glowing neon lights, cyberpunk style, cinematic lighting, 8k resolution",
        "layout": "Title"
      }
    ]
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('Raw Gemini Output:', text); // Debug log

        // Robust JSON Parsing
        try {
            // 1. Extract JSON array
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                text = jsonMatch[0];
            }

            // 2. Clean up markdown if still present (redundant but safe)
            text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');

            // 3. Fix common JSON errors (trailing commas)
            // Replace ",]" with "]" and ",}" with "}"
            text = text.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}');

            return NextResponse.json(JSON.parse(text));
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Failed Text:', text);
            // Fallback: Return error but with raw text for debugging
            return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
