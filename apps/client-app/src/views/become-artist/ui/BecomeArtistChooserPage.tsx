'use client';

import Link from 'next/link';
import { useRedirectIfArtist } from '@/features/artist/become';

export const BecomeArtistChooserPage = () => {
    if (useRedirectIfArtist()) return null;

    return (
    <section className="client-become-artist">
        <div className="client-become-artist__head">
            <h1 className="client-become-artist__title">Стати артистом на Yuviron</h1>
            <p className="client-become-artist__subtitle">Оберіть, як ви хочете долучитися.</p>
        </div>

        <div className="client-become-artist__choices">
            <Link href="/become-artist/claim" className="client-become-artist__choice">
                <div className="client-become-artist__choice-icon">
                    <i className="bi bi-patch-check" />
                </div>
                <h2 className="client-become-artist__choice-title">Я вже існую на Yuviron</h2>
                <p className="client-become-artist__choice-text">
                    Ваша музика вже на платформі. Знайдіть свій профіль і підтвердіть особу —
                    після перевірки адміністратором ви станете його власником.
                </p>
            </Link>

            <Link href="/become-artist/create" className="client-become-artist__choice">
                <div className="client-become-artist__choice-icon">
                    <i className="bi bi-mic" />
                </div>
                <h2 className="client-become-artist__choice-title">Створити нового артиста</h2>
                <p className="client-become-artist__choice-text">
                    Вас ще немає на платформі. Створіть профіль артиста з нуля — вкажіть ім’я та
                    аватар.
                </p>
            </Link>
        </div>
    </section>
    );
};

export default BecomeArtistChooserPage;
