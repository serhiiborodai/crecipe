'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllRecipes, deleteRecipe, type Recipe } from '@/lib/firestore';

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const data = await getAllRecipes();
    setRecipes(data);
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить рецепт "${title}"? Это действие нельзя отменить.`)) {
      return;
    }

    setDeleting(id);
    try {
      await deleteRecipe(id);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error) {
      alert('Ошибка удаления рецепта');
    }
    setDeleting(null);
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
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Рецепты</h1>
        <Link
          href="/admin/recipes/new"
          className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        >
          <span>+</span>
          <span className="hidden sm:inline">Добавить рецепт</span>
          <span className="sm:hidden">Добавить</span>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">📖</div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Нет рецептов</h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-6">Создайте свой первый платный рецепт</p>
          <Link
            href="/admin/recipes/new"
            className="inline-flex px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            Создать рецепт
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop таблица */}
          <div className="hidden md:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Рецепт</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Категория</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Видео</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Цена</th>
                  <th className="text-left px-6 py-3 text-zinc-400 text-sm font-medium">Статус</th>
                  <th className="text-right px-6 py-3 text-zinc-400 text-sm font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                          {recipe.category === 'Мясо' && '🥩'}
                          {recipe.category === 'Паста' && '🍝'}
                          {recipe.category === 'Десерты' && '🍮'}
                          {recipe.category === 'Японская кухня' && '🍣'}
                          {!recipe.category && '🍽️'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{recipe.title}</div>
                          <div className="text-zinc-500 text-sm truncate max-w-xs">
                            {recipe.shortDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{recipe.category || '—'}</td>
                    <td className="px-6 py-4 text-zinc-400">{recipe.videos.length}</td>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          target="_blank"
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Посмотреть на сайте"
                        >
                          👁️
                        </Link>
                        <Link
                          href={`/admin/recipes/${recipe.id}`}
                          className="p-2 text-amber-400 hover:text-amber-300 transition-colors"
                          title="Редактировать"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(recipe.id, recipe.title)}
                          disabled={deleting === recipe.id}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          {deleting === recipe.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile карточки */}
          <div className="md:hidden space-y-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
              >
                {/* Заголовок и статус */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {recipe.category === 'Мясо' && '🥩'}
                      {recipe.category === 'Паста' && '🍝'}
                      {recipe.category === 'Десерты' && '🍮'}
                      {recipe.category === 'Японская кухня' && '🍣'}
                      {!recipe.category && '🍽️'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm truncate">{recipe.title}</div>
                      <div className="text-zinc-500 text-xs truncate">{recipe.shortDescription}</div>
                    </div>
                  </div>
                  {recipe.isPublished !== false ? (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full flex-shrink-0">
                      ✓
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-[10px] rounded-full flex-shrink-0">
                      Черновик
                    </span>
                  )}
                </div>

                {/* Инфо */}
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="text-amber-400 font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}
                  </span>
                  <span className="text-zinc-500">{recipe.category || 'Без категории'}</span>
                  <span className="text-zinc-500">{recipe.videos.length} видео</span>
                </div>

                {/* Действия */}
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <Link
                    href={`/admin/recipes/${recipe.id}`}
                    className="flex-1 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg transition-colors text-center"
                  >
                    ✏️ Редактировать
                  </Link>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    target="_blank"
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
                  >
                    👁️
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id, recipe.title)}
                    disabled={deleting === recipe.id}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === recipe.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

