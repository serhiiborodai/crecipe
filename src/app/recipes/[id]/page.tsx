'use client';

import { useAuth } from '@/context/AuthContext';
import { getRecipeById, type Recipe } from '@/lib/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VimeoPlayer from '@/components/VimeoPlayer';
import BuyButton from '@/components/BuyButton';
import Link from 'next/link';

export default function RecipePage() {
  const { user, loading: authLoading, hasPurchased, signInWithGoogle } = useAuth();
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    const data = await getRecipeById(recipeId);
    setRecipe(data);
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤷</div>
          <h1 className="text-2xl font-bold text-white mb-2">Рецепт не найден</h1>
          <p className="text-zinc-400 mb-6">Возможно, он был удалён или вы перешли по неверной ссылке</p>
          <Link
            href="/"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const isPurchased = user ? hasPurchased(recipe.id) : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return { text: 'Легко', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
      case 'medium':
        return { text: 'Средне', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
      case 'hard':
        return { text: 'Сложно', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
      default:
        return null;
    }
  };

  // Не авторизован - показываем страницу с призывом войти
  if (!user) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Навигация */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </Link>

          {/* Превью рецепта */}
          <div className="relative bg-zinc-900/50 rounded-3xl border border-zinc-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                {recipe.category && (
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-300 text-sm rounded-full">
                    {recipe.category}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                {recipe.title}
              </h1>

              <p className="text-xl text-zinc-400 mb-8">
                {recipe.shortDescription}
              </p>

              {/* Заблокированный контент */}
              <div className="relative rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-12 text-center mb-8">
                <div className="absolute inset-0 backdrop-blur-sm rounded-2xl" />
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-700/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Войдите, чтобы продолжить
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    Авторизуйтесь через Google, чтобы купить рецепт и получить доступ к {recipe.videos.length} видео
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-xl transition-all shadow-xl"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Войти через Google
                  </button>
                </div>
              </div>

              {/* Что внутри */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🎬</span> Что включено
                  </h4>
                  <ul className="space-y-2">
                    {recipe.videos.map((video, index) => (
                      <li key={video.id} className="flex items-center gap-2 text-zinc-400">
                        <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                          {index + 1}
                        </span>
                        {video.title}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
                    <div className="text-3xl font-bold text-amber-400 mb-1">
                      {formatPrice(recipe.price)}
                    </div>
                    <p className="text-zinc-500 text-sm">Единоразовая оплата</p>
                  </div>

                  {recipe.youtubePromoUrl && (
                    <a
                      href={recipe.youtubePromoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-red-500/10 rounded-xl p-4 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Смотреть промо</div>
                          <div className="text-zinc-400 text-sm">на YouTube</div>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Авторизован, но не купил
  if (!isPurchased) {
    const difficulty = getDifficultyLabel(recipe.difficulty);
    
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Навигация */}
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ко всем рецептам
          </Link>

          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/50 overflow-hidden">
            {/* Шапка рецепта */}
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {recipe.category && (
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-300 text-sm rounded-full">
                    {recipe.category}
                  </span>
                )}
                {difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm border ${difficulty.color}`}>
                    {difficulty.text}
                  </span>
                )}
                {recipe.cookingTime && (
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-400 text-sm rounded-full flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recipe.cookingTime}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                {recipe.title}
              </h1>

              <p className="text-xl text-zinc-400 mb-8 whitespace-pre-line">
                {recipe.description}
              </p>

              {/* Кнопка покупки */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <BuyButton recipe={recipe} />
                
                {recipe.youtubePromoUrl && (
                  <a
                    href={recipe.youtubePromoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Смотреть промо на YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Заблокированный контент */}
            <div className="p-8 md:p-12 border-t border-zinc-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Содержание курса</h2>
              
              <div className="space-y-4">
                {recipe.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-sm">Часть {index + 1}</span>
                      </div>
                      <h3 className="text-white font-medium">{video.title}</h3>
                      {video.description && (
                        <p className="text-zinc-500 text-sm">{video.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ингредиенты */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mt-8 p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🥗</span> Ингредиенты
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-zinc-700/50 text-zinc-300 text-sm rounded-lg"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Авторизован и купил - показываем полный контент
  const difficulty = getDifficultyLabel(recipe.difficulty);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Навигация */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ко всем рецептам
        </Link>

        {/* Шапка */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-full flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Куплено
            </span>
            {recipe.category && (
              <span className="px-3 py-1 bg-zinc-800/80 text-zinc-300 text-sm rounded-full">
                {recipe.category}
              </span>
            )}
            {difficulty && (
              <span className={`px-3 py-1 rounded-full text-sm border ${difficulty.color}`}>
                {difficulty.text}
              </span>
            )}
            {recipe.cookingTime && (
              <span className="px-3 py-1 bg-zinc-800/80 text-zinc-400 text-sm rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.cookingTime}
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {recipe.title}
          </h1>

          <p className="text-xl text-zinc-400 whitespace-pre-line">
            {recipe.description}
          </p>
        </div>

        {/* Видео */}
        <div className="space-y-12">
          {recipe.videos.map((video, index) => (
            <div key={video.id} className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-900 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{video.title}</h2>
                    {video.description && (
                      <p className="text-zinc-400 text-sm">{video.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <VimeoPlayer vimeoId={video.vimeoId} title={video.title} />
              </div>
            </div>
          ))}
        </div>

        {/* Ингредиенты */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mt-12 p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🥗</span> Ингредиенты
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
