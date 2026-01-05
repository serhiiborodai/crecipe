'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, saveSiteSettings, type SiteSettings } from '@/lib/firestore';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroYoutubeUrl: '',
    footerText: '',
    features: [],
    categories: [],
    recipesPerPage: 12,
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      alert('Настройки сохранены!');
    } catch (error) {
      alert('Ошибка сохранения');
    }
    setSaving(false);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setSettings({ ...settings, features: newFeatures });
  };

  const addFeature = () => {
    setSettings({
      ...settings,
      features: [
        ...settings.features,
        { title: '', description: '', emoji: '✨' },
      ],
    });
  };

  const removeFeature = (index: number) => {
    setSettings({
      ...settings,
      features: settings.features.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Настройки сайта</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero секция */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Главная страница (Hero)</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Заголовок</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="Готовьте как профессионал"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Описание</label>
              <textarea
                value={settings.heroDescription}
                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
                placeholder="Эксклюзивные видеорецепты и мастер-классы..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">YouTube видео (ссылка)</label>
              <input
                type="text"
                value={settings.heroYoutubeUrl || ''}
                onChange={(e) => setSettings({ ...settings, heroYoutubeUrl: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-zinc-500 text-xs mt-1">Видео будет показано на главной странице вместо эмодзи</p>
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Преимущества</h2>
            <button
              onClick={addFeature}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              + Добавить
            </button>
          </div>

          <div className="space-y-4">
            {settings.features.map((feature, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-start gap-4">
                  <input
                    type="text"
                    value={feature.emoji}
                    onChange={(e) => updateFeature(index, 'emoji', e.target.value)}
                    className="w-16 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-center text-2xl focus:border-amber-500 focus:outline-none"
                    placeholder="🎬"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Название"
                    />
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Описание"
                    />
                  </div>

                  <button
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Категории */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Категории рецептов</h2>
          
          <div className="space-y-4">
            {/* Список категорий */}
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg"
                >
                  <span className="text-white">{category}</span>
                  <button
                    onClick={() => {
                      setSettings({
                        ...settings,
                        categories: settings.categories.filter((_, i) => i !== index),
                      });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Добавить категорию */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    setSettings({
                      ...settings,
                      categories: [...settings.categories, newCategory.trim()],
                    });
                    setNewCategory('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="Новая категория..."
              />
              <button
                onClick={() => {
                  if (newCategory.trim()) {
                    setSettings({
                      ...settings,
                      categories: [...settings.categories, newCategory.trim()],
                    });
                    setNewCategory('');
                  }
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </section>

        {/* Настройки отображения */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Отображение рецептов</h2>
          
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Рецептов на странице</label>
            <select
              value={settings.recipesPerPage}
              onChange={(e) => setSettings({ ...settings, recipesPerPage: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
              <option value={24}>24</option>
            </select>
          </div>
        </section>

        {/* Футер */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Подвал сайта</h2>
          
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Текст в футере</label>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              placeholder="© 2024 ChefRecipes. Все права защищены."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

