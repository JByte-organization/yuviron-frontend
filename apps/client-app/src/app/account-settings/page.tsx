import { AccountOverviewView } from '@/views/account-settings/ui/AccountOverviewView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Account Overview - Yuviron',
};

export default function AccountOverviewPage() {
    return <AccountOverviewView />;
}