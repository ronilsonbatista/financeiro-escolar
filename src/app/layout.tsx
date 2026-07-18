import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEBS Financeiro | Painel Administrativo",
  description: "Sistema de controle financeiro do Centro Educacional Batista Sobrinho — gestão de despesas, categorias e fluxo de caixa escolar.",
  keywords: "CEBS, financeiro, escola, despesas, controle financeiro, Centro Educacional Batista Sobrinho",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        {/* Tailwind CSS v3 via CDN — no PostCSS/build-step needed */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Inter font — Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind config — extend with CEBS custom colors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                    },
                    colors: {
                      'cebs-blue': '#253A8A',
                      'cebs-blue-hover': '#1C2E70',
                      'cebs-blue-light': '#19A7E0',
                      'cebs-blue-bg': 'rgba(37, 58, 138, 0.06)',
                      'cebs-yellow': '#F0DB2D',
                      'cebs-border': '#E6E1D6',
                      'cebs-bg': '#F8F7F2',
                      'brand-accent': '#253A8A',
                      'brand-primary': '#19A7E0',
                      'brand-gold': '#F0DB2D',
                      'status-success-text': '#2E7D57',
                      'status-success-bg': '#EAF5F0',
                      'status-success-border': 'rgba(46,125,87,0.15)',
                      'status-pending-text': '#B9891C',
                      'status-pending-bg': '#FFF8EB',
                      'status-pending-border': 'rgba(185,137,28,0.15)',
                      'status-overdue-text': '#B94A48',
                      'status-overdue-bg': '#FDF3F3',
                      'status-overdue-border': 'rgba(185,74,72,0.15)',
                      'status-cancelled-text': '#7A7E77',
                      'status-cancelled-bg': '#F3F4F6',
                      'status-cancelled-border': 'rgba(122,126,119,0.15)',
                    },
                  },
                },
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full antialiased font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
