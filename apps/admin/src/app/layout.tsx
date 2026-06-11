import { ApiClientProvider } from './providers/ApiClientProvider';
import { QueryProvider } from './providers/QueryProvider';
import "@repo/ui/styles";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            <ApiClientProvider>
                {children}
            </ApiClientProvider>
        </QueryProvider>
        </body>
        </html>
    );
}