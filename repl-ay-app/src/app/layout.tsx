import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import GoogleScriptLoader from '@/components/GoogleScriptLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'R; - AI Agent Crew Studio',
  description: 'Build, deploy, and manage production-grade AI agent crews with visual workflows',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleScriptLoader />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
