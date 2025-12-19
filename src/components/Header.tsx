'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const { user, loading, isAdmin, signInWithGoogle, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <span className="text-xl">🍳</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Chef<span className="text-amber-400">Recipes</span>
          </span>
        </Link>

        {/* Навигация и авторизация */}
        <div className="flex items-center gap-6">
          {user && (
            <Link
              href="/recipes"
              className="text-zinc-400 hover:text-white transition-colors font-medium"
            >
              Мои рецепты
            </Link>
          )}

          {/* Ссылка на админку */}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1"
            >
              ⚙️ Админ
            </Link>
          )}

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Пользователь'}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-amber-400/50"
                  />
                )}
                <span className="text-zinc-300 text-sm hidden sm:block">
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all"
              >
                Выйти
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg font-medium transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
