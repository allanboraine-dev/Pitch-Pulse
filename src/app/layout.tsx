import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitch Pulse | Premium Cricket Scoring",
  description: "Live cricket scoring, league management, and fan broadcasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col relative text-white bg-gray-950">
        {/* Global Stadium Background Layer */}
        <div 
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{ backgroundImage: "url('/stadium_bg.png')" }}
        ></div>
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-gray-950/80 via-gray-950/95 to-gray-950 pointer-events-none"></div>
        
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
