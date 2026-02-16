import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast"

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollabX",
  description: "Realtime collaborative workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen antialiased`}>
        {children}
         <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#fff",
              color: "#111",
            },
          }}
        />
      </body>
    </html>
  );
}