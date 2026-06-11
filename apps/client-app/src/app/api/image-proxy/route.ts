import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        // Сервер Next.js робить запит до бекенду (сервер-сервер запити не мають обмежень CORS)
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'image/jpeg';

        // Повертаємо файл у браузер від імені НАШОГО домену та додаємо CORS-дозвіл
        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[ImageProxy] Error:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}