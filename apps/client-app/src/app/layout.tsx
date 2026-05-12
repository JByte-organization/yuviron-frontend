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
        {/* Оборачиваем приложение в QueryProvider для работы хуков Orval [cite: 1568] */}
        <ApiClientProvider>
            <QueryProvider>
                {children}
            </QueryProvider>
        </ApiClientProvider>
        </body>
        </html>
    );
}