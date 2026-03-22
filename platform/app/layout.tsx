import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xquads Studio — Social Media AI",
  description:
    "Plataforma de criação de conteúdo para redes sociais powered by AI agent squads. Gera posts, carrosséis, stories e thumbnails com brand consistency.",
  keywords: ["social media", "AI", "content creation", "instagram", "design"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
