import { use } from 'react';
import { UserPage } from '@/views/user/UserPage';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    return <UserPage userId={id} />;
}