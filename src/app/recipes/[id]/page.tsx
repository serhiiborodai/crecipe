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

  // Извлекаем YouTube video ID из URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  // Не авторизован - показываем страницу с призывом войти
  if (!user) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Навигация */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </Link>

          {/* Превью рецепта */}
          <div className="relative bg-zinc-900/50 rounded-2xl sm:rounded-3xl border border-zinc-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            
            <div className="relative p-5 sm:p-8 md:p-12">
              <div className="flex items-start gap-3 mb-4 sm:mb-6">
                {recipe.category && (
                  <span className="px-2.5 py-1 sm:px-3 bg-zinc-800/80 text-zinc-300 text-xs sm:text-sm rounded-full">
                    {recipe.category}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                {recipe.title}
              </h1>

              {/* YouTube промо видео */}
              {recipe.youtubePromoUrl && getYouTubeVideoId(recipe.youtubePromoUrl) && (
                <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(recipe.youtubePromoUrl)}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                      title="Промо видео"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <p className="text-base sm:text-xl text-zinc-400 mb-6 sm:mb-8">
                {recipe.shortDescription}
              </p>

              {/* Заблокированный контент */}
              <div className="relative rounded-xl sm:rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-6 sm:p-12 text-center mb-6 sm:mb-8">
                <div className="absolute inset-0 backdrop-blur-sm rounded-xl sm:rounded-2xl" />
                <div className="relative">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-zinc-700/50 flex items-center justify-center">
                    <svg className="w-7 h-7 sm:w-10 sm:h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    Войдите, чтобы продолжить
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">
                    Авторизуйтесь, чтобы купить рецепт и получить доступ к {recipe.videos.length} видео
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-xl transition-all shadow-xl text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
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
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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

                <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
                    <div className="text-3xl font-bold text-amber-400 mb-1">
                      {formatPrice(recipe.price)}
                    </div>
                    <p className="text-zinc-500 text-sm">Единоразовая оплата</p>
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
      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Навигация */}
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ко всем рецептам
          </Link>

          <div className="bg-zinc-900/50 rounded-2xl sm:rounded-3xl border border-zinc-800/50 overflow-hidden">
            {/* Шапка рецепта */}
            <div className="relative p-5 sm:p-8 md:p-12 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {recipe.category && (
                  <span className="px-2.5 py-1 sm:px-3 bg-zinc-800/80 text-zinc-300 text-xs sm:text-sm rounded-full">
                    {recipe.category}
                  </span>
                )}
                {difficulty && (
                  <span className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm border ${difficulty.color}`}>
                    {difficulty.text}
                  </span>
                )}
                {recipe.cookingTime && (
                  <span className="px-2.5 py-1 sm:px-3 bg-zinc-800/80 text-zinc-400 text-xs sm:text-sm rounded-full flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recipe.cookingTime}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                {recipe.title}
              </h1>

              {/* YouTube промо видео */}
              {recipe.youtubePromoUrl && getYouTubeVideoId(recipe.youtubePromoUrl) && (
                <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(recipe.youtubePromoUrl)}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                      title="Промо видео"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <p className="text-sm sm:text-xl text-zinc-400 mb-6 sm:mb-8 whitespace-pre-line">
                {recipe.description}
              </p>

              {/* Кнопка покупки */}
              <BuyButton recipe={recipe} />
            </div>

            {/* Заблокированный контент */}
            <div className="p-5 sm:p-8 md:p-12 border-t border-zinc-800/50">
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
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Навигация */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ко всем рецептам
        </Link>

        {/* Шапка */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full flex items-center gap-1 sm:gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Куплено
            </span>
            {recipe.category && (
              <span className="px-2.5 py-1 sm:px-3 bg-zinc-800/80 text-zinc-300 text-xs sm:text-sm rounded-full">
                {recipe.category}
              </span>
            )}
            {difficulty && (
              <span className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm border ${difficulty.color}`}>
                {difficulty.text}
              </span>
            )}
            {recipe.cookingTime && (
              <span className="px-2.5 py-1 sm:px-3 bg-zinc-800/80 text-zinc-400 text-xs sm:text-sm rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.cookingTime}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            {recipe.title}
          </h1>

          <p className="text-sm sm:text-xl text-zinc-400 whitespace-pre-line">
            {recipe.description}
          </p>
        </div>

        {/* Видео */}
        <div className="space-y-6 sm:space-y-12">
          {recipe.videos.map((video, index) => (
            <div key={video.id} className="bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-900 font-bold text-xs sm:text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-white truncate">{video.title}</h2>
                    {video.description && (
                      <p className="text-zinc-400 text-xs sm:text-sm truncate">{video.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-4">
                <VimeoPlayer vimeoId={video.vimeoId} title={video.title} />
              </div>
            </div>
          ))}
        </div>

        {/* Ингредиенты */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mt-8 sm:mt-12 p-5 sm:p-8 bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-zinc-800/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🥗</span> Ингредиенты
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-zinc-800/30 rounded-lg sm:rounded-xl"
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-zinc-300 text-sm sm:text-base">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ссылка на Google документ */}
        {recipe.googleDocUrl && (
          <div className="mt-8 sm:mt-12">
            <a
              href={recipe.googleDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full p-5 sm:p-6 bg-blue-600 hover:bg-blue-500 rounded-xl sm:rounded-2xl transition-colors group"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
                <path d="M8 12h8v2H8zm0 4h8v2H8z"/>
              </svg>
              <span className="text-lg sm:text-xl font-bold text-white group-hover:underline">
                Читать документ
              </span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
