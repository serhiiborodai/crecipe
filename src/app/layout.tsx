import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ChefRecipes - Эксклюзивные рецепты от шефа',
  description: 'Профессиональные видеорецепты и мастер-классы по приготовлению ресторанных блюд дома',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans bg-zinc-950 text-white antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="pt-20 flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
