import { AccountNotificationsView } from '@/views/account-settings/ui/AccountNotificationsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notification Settings - Yuviron',
};

export default function AccountNotificationsPage() {
    return <AccountNotificationsView />;
}