import type { Metadata } from 'next'
import { SetupGuard } from '@/components/SetupGuard'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pampered Pooch Database',
  description: 'Professional pet grooming customer record database',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SetupGuard>{children}</SetupGuard>
      </body>
    </html>
  )
}
