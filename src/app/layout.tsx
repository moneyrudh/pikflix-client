import { ThemeProvider } from '@/lib/ThemeContext';
import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
    // Get headers to create a unique identifier for this request
    const headersList = headers();
    // Use request timestamp or any other unique value from headers
    const timestamp = (await headersList).get('x-timestamp') || Date.now().toString();
    // Generate a random number between 1-7 based on the timestamp
    const randomNum = (parseInt(timestamp) % 7) + 1;

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