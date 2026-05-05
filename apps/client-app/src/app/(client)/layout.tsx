import { ClientLayout } from '@/widgets/layout/ui/ClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ClientLayout>{children}</ClientLayout>;
}