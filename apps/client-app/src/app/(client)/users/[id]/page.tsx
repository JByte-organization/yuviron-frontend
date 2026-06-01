'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetApiAuthMe } from '@repo/api/client.ts';
import { UserProfilePage } from '@/views/user';

export default function UserDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data: meRaw, isLoading } = useGetApiAuthMe();

    const me = meRaw as unknown as { id?: string } | undefined;
    const isOwnProfile = !!me?.id && me.id === params.id;

    // Выполняем редирект как сайд-эффект ПОСЛЕ рендеринга
    useEffect(() => {
        if (isOwnProfile) {
            router.replace('/my-account');
        }
    }, [isOwnProfile, router]);

    // Пока идет загрузка или если нужен редирект, показываем пустой экран или спиннер
    if (isLoading || isOwnProfile) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    return <UserProfilePage userId={params.id} />;
}