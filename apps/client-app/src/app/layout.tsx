import type { Metadata } from "next";
import { QueryProvider } from "./providers/QueryProvider";

import "@repo/ui/styles";

export const metadata: Metadata = {
    title: "Yuviron - Музика для кожного",
    description: "Клон Spotify на стеку Next.js + FSD",
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
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}