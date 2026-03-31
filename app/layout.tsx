import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'Student Life Manager',
  description: 'Manage your tasks, reminders, and expenses — all in one place.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
