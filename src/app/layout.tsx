import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/authContext";
import NavbarWrapper from "@/app/components/navbarWrapper";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Probable.ai",
  description: "Canadian University Admissions Calculator",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-[var(--ink)] selection:bg-[var(--accent-muted)]">
        <AuthProvider>
          <NavbarWrapper />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
