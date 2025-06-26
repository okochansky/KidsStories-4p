import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kids Story Builder',
  description: 'Created by Oren K.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
