import { TrackPage } from '@/views/track/TrackPage';

interface PageProps {
    params: { id: string };
}

export default function Page({ params }: PageProps) {
    return <TrackPage trackId={params.id} />;
}