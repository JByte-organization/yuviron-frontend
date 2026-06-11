import { AccountProfileView } from '@/views/account-settings/ui/AccountProfileView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Profile - Yuviron',
};

export default function AccountProfilePage() {
    return <AccountProfileView />;
}