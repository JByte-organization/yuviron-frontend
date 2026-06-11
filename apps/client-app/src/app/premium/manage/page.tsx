import { ManagePremiumView } from '@/views/premium/ui/ManagePremiumView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manage Premium Subscription - Yuviron',
};

export default function ManagePremiumPage() {
    return <ManagePremiumView />;
}