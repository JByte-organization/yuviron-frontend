'use client';

import Link from 'next/link';
import { ClaimArtistFlow } from '@/features/artist/become';

export const ClaimArtistPage = () => (
    <section className="client-become-artist client-become-artist--narrow">
        <Link href="/become-artist" className="client-become-artist__back">
            <i className="bi bi-arrow-left" /> Назад
        </Link>

        <div className="client-become-artist__head">
            <h1 className="client-become-artist__title">Підтвердіть, що ви артист</h1>
            <p className="client-become-artist__subtitle">
                Знайдіть свій профіль і надішліть заявку на підтвердження особи.
            </p>
        </div>

        <ClaimArtistFlow />
    </section>
);

export default ClaimArtistPage;
