import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coach de Cultivo",
  description: "Seu assistente de cultivo indoor de cannabis medicinal",
  manifest: "/manifest.json",
  themeColor: "#072108",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-bark-950 text-bark-50 min-h-screen`}>
        {/* Navbar */}
        <header className="border-b border-bark-800 bg-bark-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="font-semibold text-canopy-400 tracking-tight">
                Coach de Cultivo
              </span>
            </div>
            <span className="text-xs text-bark-400 font-mono">v0.1</span>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
