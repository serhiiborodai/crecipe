'use client';

import { useAuth } from '@/context/AuthContext';
import { getPublishedRecipes, getSiteSettings, type Recipe, type SiteSettings } from '@/lib/firestore';
import RecipeCard from '@/components/RecipeCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function RecipesPage() {
  const { user, loading: authLoading, purchases, isAdmin } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Фильтры
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'purchased' | 'not_purchased'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [recipesData, settingsData] = await Promise.all([
      getPublishedRecipes(),
      getSiteSettings(),
    ]);
    setRecipes(recipesData);
    setSettings(settingsData);
    setLoading(false);
  };

  // Получаем уникальные категории из рецептов
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    recipes.forEach(r => {
      if (r.category) categories.add(r.category);
    });
    return Array.from(categories);
  }, [recipes]);

  // Фильтрация рецептов
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Фильтр по покупке
      if (purchaseFilter === 'purchased' && !purchases.includes(recipe.id) && !isAdmin) {
        return false;
      }
      if (purchaseFilter === 'not_purchased' && (purchases.includes(recipe.id) || isAdmin)) {
        return false;
      }

      // Фильтр по категории
      if (categoryFilter !== 'all' && recipe.category !== categoryFilter) {
        return false;
      }

      // Поиск по тексту
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = recipe.title.toLowerCase().includes(query);
        const descMatch = recipe.shortDescription?.toLowerCase().includes(query);
        const fullDescMatch = recipe.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !fullDescMatch) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, purchaseFilter, categoryFilter, searchQuery, purchases, isAdmin]);

  // Пагинация
  const recipesPerPage = settings?.recipesPerPage || 12;
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * recipesPerPage;
    return filteredRecipes.slice(start, start + recipesPerPage);
  }, [filteredRecipes, currentPage, recipesPerPage]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [purchaseFilter, categoryFilter, searchQuery]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const purchasedCount = isAdmin ? recipes.length : recipes.filter(r => purchases.includes(r.id)).length;
  const notPurchasedCount = isAdmin ? 0 : recipes.length - purchasedCount;

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">
            Все <span className="text-amber-400">рецепты</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-lg">
            {isAdmin 
              ? `Вы админ — у вас доступ ко всем ${recipes.length} рецептам`
              : purchasedCount > 0 
                ? `У вас ${purchasedCount} из ${recipes.length} рецептов`
                : 'Выберите рецепт, который хотите изучить'
            }
          </p>
        </div>

        {/* Поиск */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <svg 
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm sm:text-base placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Фильтры по покупке */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => setPurchaseFilter('all')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all ${
              purchaseFilter === 'all'
                ? 'bg-amber-500 text-zinc-900'
                : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Все ({recipes.length})
          </button>
          <button
            onClick={() => setPurchaseFilter('purchased')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
              purchaseFilter === 'purchased'
                ? 'bg-emerald-500 text-white'
                : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">{isAdmin ? 'Доступно' : 'Куплено'}</span>
            <span className="sm:hidden">✓</span>
            ({purchasedCount})
          </button>
          {!isAdmin && (
            <button
              onClick={() => setPurchaseFilter('not_purchased')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                purchaseFilter === 'not_purchased'
                  ? 'bg-zinc-600 text-white'
                  : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Купить</span>
              ({notPurchasedCount})
            </button>
          )}
        </div>

        {/* Фильтр по категориям */}
        {availableCategories.length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
            <div className="flex gap-2 min-w-max sm:flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent'
                }`}
              >
                Все
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    categoryFilter === category
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Результаты поиска */}
        {searchQuery && (
          <div className="mb-3 sm:mb-4 text-zinc-400 text-sm">
            Найдено: {filteredRecipes.length}
          </div>
        )}

        {/* Сетка рецептов */}
        {paginatedRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm sm:text-base"
                >
                  ←
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-amber-500 text-zinc-900'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="px-1 sm:px-2 text-zinc-500 text-sm">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm sm:text-base"
                >
                  →
                </button>
              </div>
            )}

            {/* Информация о пагинации */}
            {totalPages > 1 && (
              <div className="text-center mt-3 sm:mt-4 text-zinc-500 text-xs sm:text-sm">
                {currentPage} / {totalPages} • {paginatedRecipes.length} из {filteredRecipes.length}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-400 mb-2">
              {searchQuery
                ? 'Ничего не найдено'
                : purchaseFilter === 'purchased' 
                  ? 'У вас пока нет купленных рецептов'
                  : purchaseFilter === 'not_purchased'
                    ? 'Вы купили все доступные рецепты!'
                    : 'Нет рецептов в этой категории'
              }
            </h3>
            {searchQuery && (
              <p className="text-zinc-500 text-sm mb-4">Попробуйте изменить запрос</p>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setPurchaseFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 px-5 sm:px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
