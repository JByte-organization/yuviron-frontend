import { QueryProvider } from '@/app/providers/QueryProvider';
import "@repo/ui/styles";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}