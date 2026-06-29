import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import AuthSessionProvider from "@/components/providers/session-provider"
import { bootstrapApp } from "@/lib/bootstrap"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AITS Portal",
  description: "Annamacharya Institute of Technology and Sciences academic portal.",
  keywords: ["AITS", "Annamacharya Institute of Technology and Sciences", "Portal", "Education", "Academic"],
  icons: {
    icon: "/aits.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await bootstrapApp()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
