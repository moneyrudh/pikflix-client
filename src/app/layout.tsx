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
      icon: `/logos/${randomNum}.png`,
      // Optional: also set apple touch icon
      apple: `/logos/${randomNum}.png`,
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