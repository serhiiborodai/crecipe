'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  // Закрываем меню при переходе
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">🔒</div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Доступ запрещён</h1>
          <p className="text-zinc-400 text-sm sm:text-base mb-6">У вас нет прав для просмотра этой страницы</p>
          <Link
            href="/"
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Главная', icon: '📊' },
    { href: '/admin/recipes', label: 'Рецепты', icon: '🍳' },
    { href: '/admin/settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Админская навигация */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Desktop навигация */}
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="text-xl">⚙️</span>
                Админ-панель
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin/recipes"
                  className={`transition-colors ${
                    pathname === '/admin/recipes' || pathname.startsWith('/admin/recipes/')
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Рецепты
                </Link>
                <Link
                  href="/admin/settings"
                  className={`transition-colors ${
                    pathname === '/admin/settings' ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Настройки сайта
                </Link>
              </nav>
            </div>

            {/* Mobile заголовок */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                {mobileNavOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <span className="text-amber-400 font-bold text-sm">Админ</span>
            </div>

            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              ← <span className="hidden sm:inline">Вернуться на</span> Сайт
            </Link>
          </div>

          {/* Mobile навигация */}
          {mobileNavOpen && (
            <nav className="sm:hidden mt-3 pt-3 border-t border-zinc-800 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
