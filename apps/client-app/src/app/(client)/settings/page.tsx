import { SettingsPreferencesPage } from '@/features/settings/ui/SettingsPreferencesPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings - Yuviron',
    description: 'Manage your music preference and layout appearance presets',
};

export default function SettingsPage() {
    return <SettingsPreferencesPage />;
}