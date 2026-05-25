import type { Metadata } from "next";
import { ApiClientProvider } from "./providers/ApiClientProvider";
import { QueryProvider } from "./providers/QueryProvider";

import "@repo/ui/styles";

export const metadata: Metadata = {
    title: "Yuviron - Музика для кожного",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="uk">
        <body className={`bg-dark text-white`}>
        <QueryProvider>
            <ApiClientProvider>
                {children}
            </ApiClientProvider>
        </QueryProvider>
        </body>
        </html>
    );
}