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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Рецепты</h1>
        <Link
          href="/admin/recipes/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Добавить рецепт
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-bold text-white mb-2">Нет рецептов</h2>
          <p className="text-zinc-400 mb-6">Создайте свой первый платный рецепт</p>
          <Link
            href="/admin/recipes/new"
            className="inline-flex px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            Создать рецепт
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
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
      )}
    </div>
  );
}

