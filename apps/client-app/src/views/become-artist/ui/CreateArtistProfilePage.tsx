'use client';

import Link from 'next/link';
import { CreateArtistForm } from '@/features/artist/become';

export const CreateArtistProfilePage = () => (
    <section className="client-become-artist client-become-artist--narrow">
        <Link href="/become-artist" className="client-become-artist__back">
            <i className="bi bi-arrow-left" /> Назад
        </Link>

        <div className="client-become-artist__head">
            <h1 className="client-become-artist__title">Створити профіль артиста</h1>
            <p className="client-become-artist__subtitle">
                Вкажіть ім’я, під яким вас бачитимуть слухачі.
            </p>
        </div>

        <CreateArtistForm />
    </section>
);

export default CreateArtistProfilePage;
