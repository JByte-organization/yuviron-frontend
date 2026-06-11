import { AccountSecurityView } from '@/views/account-settings/ui/AccountSecurityView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security & Devices - Yuviron',
};

export default function AccountSecurityPage() {
    return <AccountSecurityView />;
}