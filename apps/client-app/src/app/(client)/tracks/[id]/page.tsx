import { TrackPage } from '@/views/track/TrackPage';
import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    return <TrackPage trackId={id} />;
}