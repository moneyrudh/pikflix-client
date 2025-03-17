import { ThemeProvider } from '@/lib/ThemeContext';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PikFlix - Natural Language Movie Discovery',
  description: 'Discover movies through natural language queries',
};

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