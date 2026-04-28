import { ArtistPage } from '@/views/artist/ArtistPage';

interface PageProps {
    params: { id: string };
}

export default function Page({ params }: PageProps) {
    return <ArtistPage artistId={params.id} />;
}