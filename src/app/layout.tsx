import { ThemeProvider } from '@/lib/ThemeContext';
import './globals.css';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'pikflix - Natural Language Movie Discovery',
        description: 'Discover movies through natural language queries',
        icons: {
            icon: [
                { url: `/logos/16x16.png`, sizes: '16x16', type: 'image/png' },
                { url: `/logos/32x32.png`, sizes: '32x32', type: 'image/png' },
                { url: `/logos/64x64.png`, sizes: '64x64', type: 'image/png' },
            ],
            apple: [
                { url: `/logos/180x180.png`, sizes: '180x180', type: 'image/png' },
            ],
        },
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <ThemeProvider>
                <body>
                    {children}
                </body>
            </ThemeProvider>
        </html>
    );
}