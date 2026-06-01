import type { Metadata } from "next";
import { ApiClientProvider } from "./providers/ApiClientProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "@/shared/lib/ThemeProvider";

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
        <body className="client-body">
        <QueryProvider>
            <ApiClientProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </ApiClientProvider>
        </QueryProvider>
        </body>
        </html>
    );
}