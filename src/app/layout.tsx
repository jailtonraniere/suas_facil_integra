import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SUAS Fácil Integra",
    description: "Sistema de Monitoramento de Vulnerabilidade Social e Saúde — SUAS + SUS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    );
}
