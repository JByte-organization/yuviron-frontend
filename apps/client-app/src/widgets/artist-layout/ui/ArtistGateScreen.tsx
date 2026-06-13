'use client';

import React from 'react';
import Link from 'next/link';

// Екран-гейт кабінету артиста в чистому auth-шеллі (без хедера/сайдбара/футера) —
// як сторінки логіну/реєстрації. Показуємо, поки відновлюється сесія (loading) або
// коли користувач ще не артист.
export const ArtistGateScreen = ({ loading = false }: { loading?: boolean }) => (
    <main className="client-auth-shell">
        {loading ? (
            <div className="client-become-artist__result">
                <div className="client-become-artist__result-icon">
                    <i className="bi bi-arrow-repeat" />
                </div>
                <p className="client-become-artist__result-text">Завантаження кабінету…</p>
            </div>
        ) : (
            <div className="client-become-artist__result">
                <div className="client-become-artist__result-icon client-become-artist__result-icon--star">
                    <i className="bi bi-mic" />
                </div>
                <h2 className="client-become-artist__result-title">Кабінет артиста недоступний</h2>
                <p className="client-become-artist__result-text">
                    Схоже, у вас ще немає профілю артиста. Створіть його, щоб завантажувати музику.
                </p>
                <Link
                    href="/become-artist"
                    className="client-become-artist__btn client-become-artist__btn--primary"
                >
                    Стати артистом
                </Link>
            </div>
        )}
    </main>
);
