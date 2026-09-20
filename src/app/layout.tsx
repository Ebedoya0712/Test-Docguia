import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocGuía | Disponibilidad y Reserva de Citas",
  description:
    "Sistema ágil de agendamiento y reserva de citas médicas para profesionales de salud.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className="min-h-screen bg-[#faf8ff] text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
