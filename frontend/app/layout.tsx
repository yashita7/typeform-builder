import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Typeform Clone",
  description: "Build and share beautiful forms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e5e7',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            className: 'animate-slideUp',
          }}
          richColors
        />
      </body>
    </html>
  );
}
