import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinLedgeArena — Learn markets by doing",
  description:
    "A new way to learn Indian markets: short lessons, decision challenges, and a strategy terminal for simulated practice.",
  icons: {
    icon: "/src/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/src/assets/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
