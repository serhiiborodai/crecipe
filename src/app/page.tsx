'use client';

import { useAuth } from '@/context/AuthContext';
import { getPublishedRecipes, getSiteSettings, type Recipe, type SiteSettings } from '@/lib/firestore';
import RecipeCard from '@/components/RecipeCard';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, loading: authLoading, isConfigured, signInWithGoogle } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipesData, settingsData] = await Promise.all([
        getPublishedRecipes(),
        getSiteSettings(),
      ]);
      
      setRecipes(recipesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Не авторизован - показываем лендинг
  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Баннер если Firebase не настроен */}
        {!isConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3 text-amber-400">
              <span className="text-xl">⚠️</span>
              <span className="text-sm">
                <strong>Демо-режим:</strong> Firebase не настроен. Авторизация недоступна. 
                Смотри инструкцию в <code className="bg-amber-500/20 px-1 rounded">SETUP.md</code>
              </span>
            </div>
          </div>
        )}

        {/* Фоновые элементы */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-900/5 to-transparent rounded-full" />
        </div>

        {/* Hero секция */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Декоративные элементы */}
            <div className="flex justify-center gap-4 mb-8 opacity-0 animate-fade-in">
              <span className="text-5xl animate-float">🍳</span>
              <span className="text-5xl animate-float delay-200">👨‍🍳</span>
              <span className="text-5xl animate-float delay-400">🔥</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-fade-in delay-100">
              {settings?.heroTitle?.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                {settings?.heroTitle?.split(' ').slice(-1)[0] || 'профессионал'}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in delay-200">
              {settings?.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in delay-300">
              <button
                onClick={signInWithGoogle}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Войти через Google
              </button>

              <a
                href="#preview"
                className="px-8 py-4 border-2 border-zinc-700 hover:border-zinc-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-zinc-800/50 flex items-center justify-center gap-2"
              >
                Посмотреть рецепты
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Превью рецептов */}
        <section id="preview" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Доступные <span className="text-amber-400">рецепты</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                {isConfigured 
                  ? 'Войдите в аккаунт, чтобы получить доступ к полным видеоурокам'
                  : 'Настройте Firebase для включения авторизации и покупок'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.slice(0, 3).map((recipe) => (
                <article 
                  key={recipe.id} 
                  className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 cursor-pointer hover:border-amber-500/30 transition-all"
                  onClick={signInWithGoogle}
                >
                  <div className="relative h-56 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                      {recipe.category === 'Мясо' && '🥩'}
                      {recipe.category === 'Паста' && '🍝'}
                      {recipe.category === 'Десерты' && '🍮'}
                      {recipe.category === 'Японская кухня' && '🍣'}
                      {!recipe.category && '🍽️'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {isConfigured ? 'Войдите для доступа' : 'Настройте Firebase'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{recipe.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}
                      </span>
                      <span className="text-zinc-500 text-sm">{recipe.videos.length} видео</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {recipes.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={signInWithGoogle}
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                >
                  Показать все рецепты ({recipes.length})
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        {settings?.features && settings.features.length > 0 && (
          <section className="py-20 px-6 bg-zinc-900/30">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {settings.features.map((feature, index) => (
                  <div key={index} className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-3xl">
                      {feature.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto text-center text-zinc-500">
            <p>{settings?.footerText}</p>
          </div>
        </footer>
      </div>
    );
  }

  // Авторизован - показываем список рецептов
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Добро пожаловать, <span className="text-amber-400">{user.displayName?.split(' ')[0]}</span>!
          </h1>
          <p className="text-zinc-400 text-lg">
            Вот все доступные рецепты. Купленные отмечены зелёным бейджем.
          </p>
        </div>

        {/* Сетка рецептов */}
        {recipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-white mb-2">Рецептов пока нет</h2>
            <p className="text-zinc-400">Скоро здесь появятся эксклюзивные рецепты!</p>
          </div>
        )}
      </div>
    </div>
  );
}
