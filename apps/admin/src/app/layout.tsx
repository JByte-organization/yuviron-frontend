import { ApiClientProvider } from './providers/ApiClientProvider';
import { QueryProvider } from './providers/QueryProvider';
import "@repo/ui/styles";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
        <body>
        <ApiClientProvider>      {/* ← должен быть снаружи QueryProvider */}
            <QueryProvider>
                {children}
            </QueryProvider>
        </ApiClientProvider>
        </body>
        </html>
    );
}