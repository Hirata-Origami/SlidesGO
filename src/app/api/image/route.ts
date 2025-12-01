import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
    try {
        const { prompt, raphaelToken: providedToken } = await req.json();

        let token = providedToken;

        if (!token) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader) {
                const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                    global: { headers: { Authorization: authHeader } }
                });

                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('user_api_keys')
                        .select('raphael_ai_token')
                        .eq('user_id', user.id)
                        .single();

                    if (data?.raphael_ai_token) {
                        token = data.raphael_ai_token;
                    }
                }
            }
        }

        if (!token) {
            return NextResponse.json({ error: 'Raphael AI Token not configured' }, { status: 500 });
        }

        const response = await fetch('https://raphaelai.org/api/v3/imagen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                width: 1024,
                height: 1024,
                token: token,
            }),
        });

        const data = await response.json();

        if (data.images && data.images.length > 0 && data.images[0].image) {
            // Raphael returns base64 string, usually without prefix
            let base64Image = data.images[0].image;
            if (!base64Image.startsWith('data:image')) {
                base64Image = `data:image/jpeg;base64,${base64Image}`;
            }
            return NextResponse.json({ url: base64Image });
        } else {
            console.error('Raphael AI Error:', data);
            return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
        }
    } catch (error) {
        console.error('Raphael AI API Error:', error);
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
