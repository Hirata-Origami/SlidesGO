export const generateSlideContent = async (topic: string, slideCount: number = 5, apiKey?: string): Promise<any[]> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slideCount, apiKey }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
    }

    return response.json();
};

export const generateImage = async (prompt: string, raphaelToken?: string): Promise<string> => {
    const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, raphaelToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.url;
};
