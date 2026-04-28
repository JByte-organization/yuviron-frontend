// app/(client)/artists/[id]/page.tsx

import { ArtistPage } from '@/views/artist/ArtistPage';
import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params); // ← розгортаємо Promise через React.use()
    return <ArtistPage artistId={id} />;
}