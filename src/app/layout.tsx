import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atlas — Aadhil\'s Travel Archive',
  description: 'Every country. Every memory. Every person.',
  openGraph: {
    title: 'Atlas — Travel Archive',
    description: 'Every country. Every memory. Every person.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
