import { PremiumHubView } from '@/views/premium/ui/PremiumHubView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Yuviron Premium - Studio & Customization Lab',
};

export default function PremiumHubPage() {
    return <PremiumHubView />;
}