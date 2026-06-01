import type { Metadata } from 'next';
import { AlbumPage } from '@/views/album/AlbumPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: 'Альбом | Yuviron',
    description: 'Перегляд альбому та треків у Yuviron',
};

export default async function Page({ params }: PageProps) {
    // Фікс Next.js 15 асинхронних параметрів
    const resolvedParams = await params;

    return <AlbumPage albumId={resolvedParams.id} />;
}