'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllRecipes, type Recipe } from '@/lib/firestore';

export default function AdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const recipesData = await getAllRecipes();
    setRecipes(recipesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Панель управления</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Рецепты */}
        <Link
          href="/admin/recipes"
          className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6 hover:border-amber-500/50 transition-colors group"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📖</div>
          <h2 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
            Рецепты
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-4 hidden sm:block">
            Управление рецептами, видео и ценами
          </p>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">
            {recipes.length}
          </div>
          <div className="text-zinc-500 text-xs sm:text-sm">рецептов</div>
        </Link>

        {/* Настройки */}
        <Link
          href="/admin/settings"
          className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6 hover:border-amber-500/50 transition-colors group"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⚙️</div>
          <h2 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
            Настройки
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-4 hidden sm:block">
            Тексты, заголовки и описания
          </p>
          <div className="text-zinc-500 text-xs sm:text-sm">Редактировать →</div>
        </Link>

        {/* Создать рецепт */}
        <Link
          href="/admin/recipes/new"
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 p-4 sm:p-6 hover:border-amber-500/50 transition-colors group"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">➕</div>
          <h2 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
            Новый рецепт
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-4">
            Создать новый платный рецепт
          </p>
          <div className="text-amber-400 text-xs sm:text-sm">Создать →</div>
        </Link>
      </div>

      {/* Быстрые действия */}
      <div className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Последние рецепты</h2>
        
        {/* Desktop таблица */}
        <div className="hidden sm:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {recipes.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Рецептов пока нет. Создайте первый!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Название</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Категория</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Цена</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Статус</th>
                  <th className="text-right px-6 py-3 text-zinc-400 text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recipes.slice(0, 5).map((recipe) => (
                  <tr key={recipe.id} className="border-t border-zinc-800">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{recipe.title}</div>
                      <div className="text-zinc-500 text-sm">{recipe.videos.length} видео</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{recipe.category || '—'}</td>
                    <td className="px-6 py-4 text-amber-400 font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}
                    </td>
                    <td className="px-6 py-4">
                      {recipe.isPublished !== false ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Опубликован
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-xs rounded-full">
                          Черновик
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/recipes/${recipe.id}`}
                        className="text-amber-400 hover:text-amber-300 text-sm"
                      >
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile карточки */}
        <div className="sm:hidden space-y-3">
          {recipes.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center text-zinc-500 text-sm">
              Рецептов пока нет. Создайте первый!
            </div>
          ) : (
            recipes.slice(0, 5).map((recipe) => (
              <Link
                key={recipe.id}
                href={`/admin/recipes/${recipe.id}`}
                className="block bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-white text-sm line-clamp-1">{recipe.title}</div>
                  {recipe.isPublished !== false ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full flex-shrink-0 ml-2">
                      ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-500/20 text-zinc-400 text-[10px] rounded-full flex-shrink-0 ml-2">
                      ●
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-amber-400 font-medium">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}
                  </span>
                  <span className="text-zinc-500">{recipe.category || 'Без категории'}</span>
                  <span className="text-zinc-500">{recipe.videos.length} видео</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
