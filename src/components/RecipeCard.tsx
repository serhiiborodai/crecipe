'use client';

import { type Recipe } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { hasPurchased } = useAuth();
  const isPurchased = hasPurchased(recipe.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return { text: 'Легко', color: 'text-emerald-400 bg-emerald-400/10' };
      case 'medium':
        return { text: 'Средне', color: 'text-amber-400 bg-amber-400/10' };
      case 'hard':
        return { text: 'Сложно', color: 'text-rose-400 bg-rose-400/10' };
      default:
        return null;
    }
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case 'Мясо': return '🥩';
      case 'Паста': return '🍝';
      case 'Десерты': return '🍮';
      case 'Японская кухня': return '🍣';
      case 'Выпечка': return '🥐';
      case 'Супы': return '🍜';
      case 'Салаты': return '🥗';
      case 'Морепродукты': return '🦐';
      default: return '🍽️';
    }
  };

  const difficulty = getDifficultyLabel(recipe.difficulty);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <article className="group relative bg-zinc-900/50 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5 active:scale-[0.98]">
        {/* Обложка */}
        <div className="relative h-32 sm:h-56 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
          {/* Placeholder для изображения */}
          <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl opacity-30 group-hover:scale-110 transition-transform duration-700">
            {getCategoryEmoji(recipe.category)}
          </div>
          
          {/* Градиент */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          
          {/* Бейдж куплено/цена */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            {isPurchased ? (
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full flex items-center gap-1 sm:gap-1.5 shadow-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Куплено</span>
                <span className="sm:hidden">✓</span>
              </span>
            ) : (
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-amber-500 text-zinc-900 text-xs sm:text-sm font-bold rounded-full shadow-lg">
                {formatPrice(recipe.price)}
              </span>
            )}
          </div>

          {/* Категория - скрыта на мобильном */}
          {recipe.category && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 hidden sm:block">
              <span className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-xs font-medium rounded-full border border-zinc-700/50">
                {recipe.category}
              </span>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-3 sm:p-6">
          <h3 className="text-sm sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors line-clamp-1 sm:line-clamp-none">
            {recipe.title}
          </h3>
          
          <p className="text-zinc-400 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2">
            {recipe.shortDescription}
          </p>

          {/* Мета информация */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            {/* Сложность - скрыта на мобильном */}
            {difficulty && (
              <span className={`px-2 py-1 rounded-md hidden sm:inline-block ${difficulty.color}`}>
                {difficulty.text}
              </span>
            )}
            
            {/* Время - показываем только на мобильном если нет сложности */}
            {recipe.cookingTime && (
              <span className="text-zinc-500 flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">{recipe.cookingTime}</span>
                <span className="sm:hidden">{recipe.cookingTime.replace(' минут', 'м').replace(' час', 'ч')}</span>
              </span>
            )}
            
            <span className="text-zinc-500 flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {recipe.videos.length}
            </span>
          </div>
        </div>

        {/* Hover эффект */}
        <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/20 rounded-xl sm:rounded-2xl transition-all duration-500 pointer-events-none" />
      </article>
    </Link>
  );
}
