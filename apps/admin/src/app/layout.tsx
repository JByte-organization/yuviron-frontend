import { ApiClientProvider } from './providers/ApiClientProvider';
import { QueryProvider } from './providers/QueryProvider';
import "@repo/ui/styles";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Admin Panel - Yuviron",

    manifest: "/images/favicon/site.webmanifest",

    appleWebApp: {
        title: "Yuviron",
        statusBarStyle: "default",
        capable: true,
    },

    icons: {
        icon: [
            { url: "/images/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
            { url: "/images/favicon/favicon.svg", type: "image/svg+xml" },
        ],
        shortcut: "/images/favicon/favicon.ico",
        apple: [
            { url: "/images/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
};

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