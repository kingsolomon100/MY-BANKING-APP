import React from "react";
import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: 'Secure Bank Portal',
  description: 'Fully sandboxed secure legdger access overview dashboard'
};

export default function RootLayout({
  children,
}: {children: React.ReactNode;})
{
  return(
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}