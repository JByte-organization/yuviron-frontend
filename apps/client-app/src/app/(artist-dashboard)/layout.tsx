// app/(artist-dashboard)/layout.tsx
import { ArtistDashboardLayout } from '@/widgets/artist-layout/ui/ArtistDashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ArtistDashboardLayout>{children}</ArtistDashboardLayout>;
}