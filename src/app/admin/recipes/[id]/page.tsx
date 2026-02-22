'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRecipeById, saveRecipe, getSiteSettings, type Recipe, type RecipeVideo } from '@/lib/firestore';
import { uploadImage } from '@/lib/firebase';

const DIFFICULTIES = [
  { value: 'easy', label: 'Легко' },
  { value: 'medium', label: 'Средне' },
  { value: 'hard', label: 'Сложно' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function RecipeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipe, setRecipe] = useState<Recipe>({
    id: generateId(),
    title: '',
    description: '',
    shortDescription: '',
    price: 999, // $9.99 по умолчанию
    coverImage: '',
    youtubePromoUrl: '',
    videos: [],
    ingredients: [],
    cookingTime: '',
    difficulty: 'medium',
    category: '',
    order: 0,
    isPublished: false,
  });

  useEffect(() => {
    loadCategories();
    if (!isNew) {
      loadRecipe();
    }
  }, [params.id]);

  const loadCategories = async () => {
    const settings = await getSiteSettings();
    setCategories(settings.categories || []);
  };

  const loadRecipe = async () => {
    const data = await getRecipeById(params.id as string);
    if (data) {
      setRecipe(data);
    } else {
      router.push('/admin/recipes');
    }
    setLoading(false);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!recipe.title.trim()) {
      alert('Введите название рецепта');
      return;
    }

    setSaving(true);
    try {
      await saveRecipe({
        ...recipe,
        isPublished: publish ? true : recipe.isPublished,
      });
      
      if (isNew) {
        router.push(`/admin/recipes/${recipe.id}`);
      }
      
      alert(publish ? 'Рецепт опубликован!' : 'Сохранено!');
    } catch (error) {
      alert('Ошибка сохранения');
    }
    setSaving(false);
  };

  const addVideo = () => {
    setRecipe({
      ...recipe,
      videos: [
        ...recipe.videos,
        {
          id: generateId(),
          title: `Часть ${recipe.videos.length + 1}`,
          vimeoId: '',
          description: '',
        },
      ],
    });
  };

  const updateVideo = (index: number, field: keyof RecipeVideo, value: string) => {
    const newVideos = [...recipe.videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setRecipe({ ...recipe, videos: newVideos });
  };

  const removeVideo = (index: number) => {
    setRecipe({
      ...recipe,
      videos: recipe.videos.filter((_, i) => i !== index),
    });
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...recipe.videos];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
    setRecipe({ ...recipe, videos: newVideos });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой (макс. 5MB)');
      return;
    }

    setUploading(true);
    try {
      const path = `covers/${recipe.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const url = await uploadImage(file, path);
      setRecipe({ ...recipe, coverImage: url });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки изображения');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/recipes" className="text-zinc-400 hover:text-white text-sm mb-2 inline-block">
            ← Назад к списку
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Новый рецепт' : 'Редактирование рецепта'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить черновик'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Опубликовать'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Основная информация */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Основная информация</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Название *</label>
              <input
                type="text"
                value={recipe.title}
                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="Идеальный стейк Рибай"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Краткое описание</label>
              <input
                type="text"
                value={recipe.shortDescription}
                onChange={(e) => setRecipe({ ...recipe, shortDescription: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="Показывается в карточке рецепта"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Полное описание</label>
              <textarea
                value={recipe.description}
                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
                placeholder="Подробное описание рецепта..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Категория</label>
                <select
                  value={recipe.category || ''}
                  onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-zinc-500 text-xs mt-1">
                    Добавьте категории в <Link href="/admin/settings" className="text-amber-400 hover:underline">настройках</Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Сложность</label>
                <select
                  value={recipe.difficulty || 'medium'}
                  onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value as Recipe['difficulty'] })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Время приготовления</label>
                <input
                  type="text"
                  value={recipe.cookingTime || ''}
                  onChange={(e) => setRecipe({ ...recipe, cookingTime: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  placeholder="30 минут"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Цена (в долларах)</label>
                <input
                  type="number"
                  value={recipe.price / 100}
                  onChange={(e) => setRecipe({ ...recipe, price: Number(e.target.value) * 100 })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Обложка</label>
              
              <div className="flex gap-4 items-start">
                {/* Превью */}
                <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                  {recipe.coverImage ? (
                    <>
                      <img 
                        src={recipe.coverImage} 
                        alt="Превью" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setRecipe({ ...recipe, coverImage: '' })}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-3xl">
                      🖼️
                    </div>
                  )}
                </div>

                {/* Кнопки */}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Загрузка...' : '📷 Загрузить фото'}
                  </button>
                  <span className="text-zinc-500 text-xs">JPG, PNG до 5MB</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">YouTube промо (ссылка)</label>
              <input
                type="url"
                value={recipe.youtubePromoUrl || ''}
                onChange={(e) => setRecipe({ ...recipe, youtubePromoUrl: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Ингредиенты (через запятую)</label>
              <input
                type="text"
                value={(recipe.ingredients || []).join(', ')}
                onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                placeholder="Стейк 400г, Масло, Чеснок, Тимьян"
              />
            </div>
          </div>
        </section>

        {/* Видео */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Видео ({recipe.videos.length})</h2>
            <button
              onClick={addVideo}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              + Добавить видео
            </button>
          </div>

          {recipe.videos.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="text-4xl mb-2">🎬</div>
              Добавьте видео для рецепта
            </div>
          ) : (
            <div className="space-y-4">
              {recipe.videos.map((video, index) => (
                <div key={video.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveVideo(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <span className="text-center text-zinc-500 text-sm">{index + 1}</span>
                      <button
                        onClick={() => moveVideo(index, 'down')}
                        disabled={index === recipe.videos.length - 1}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Название видео"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={video.vimeoId}
                          onChange={(e) => updateVideo(index, 'vimeoId', e.target.value)}
                          className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:border-amber-500 focus:outline-none"
                          placeholder="Vimeo ID (например: 76979871)"
                        />
                        <input
                          type="text"
                          value={video.description || ''}
                          onChange={(e) => updateVideo(index, 'description', e.target.value)}
                          className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:border-amber-500 focus:outline-none"
                          placeholder="Описание (опционально)"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeVideo(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <h4 className="text-sm font-medium text-zinc-300 mb-2">💡 Как получить Vimeo ID</h4>
            <p className="text-zinc-500 text-sm">
              Откройте видео на Vimeo, скопируйте URL. ID — это число в конце: <br />
              <code className="text-amber-400">https://vimeo.com/<strong>76979871</strong></code> → ID: <strong>76979871</strong>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

