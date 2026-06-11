import { use } from 'react';
import { PlaylistPage } from '@/views/playlist/PlaylistPage';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    return <PlaylistPage playlistId={id} />;
}