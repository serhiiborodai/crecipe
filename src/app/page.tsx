'use client';

import { useAuth } from '@/context/AuthContext';
import { getPublishedRecipes, getSiteSettings, type Recipe, type SiteSettings } from '@/lib/firestore';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GiftModal from '@/components/GiftModal';

// Компонент FAQ аккордеон
function FaqAccordion({ faq }: { faq: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number>(0); // Первый открыт по умолчанию

  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
          Часто задаваемые <span className="text-amber-400">вопросы</span>
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {faq.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-zinc-800/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left hover:bg-zinc-800/30 transition-colors"
              >
                <span className="text-white font-medium text-sm sm:text-base">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-amber-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-zinc-400 text-sm sm:text-base leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Извлекаем YouTube video ID из URL
const getYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
};

function HomeContent() {
  const { user, loading: authLoading, isConfigured, signInWithGoogle, hasPurchased } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftSuccessOpen, setGiftSuccessOpen] = useState(false);
  const [buyingRecipeId, setBuyingRecipeId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Проверяем параметр ?gift=success
  useEffect(() => {
    if (searchParams.get('gift') === 'success') {
      setGiftSuccessOpen(true);
      // Убираем параметр из URL
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

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

  // Скролл к якорю после загрузки
  useEffect(() => {
    if (!loading && !authLoading) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [loading, authLoading]);

  const handleBuyRecipe = async (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (!user || buyingRecipeId) return;

    setBuyingRecipeId(recipe.id);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          price: recipe.price,
          userId: user.uid,
          userEmail: user.email,
          isGift: false,
          recipientEmail: user.email,
          isSelfGift: false,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Ошибка при создании сессии оплаты:', err);
      alert('Ошибка при создании сессии оплаты');
    } finally {
      setBuyingRecipeId(null);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    if (user) {
      router.push(`/recipes/${recipeId}`);
    } else {
      signInWithGoogle();
    }
  };

  const handleMainButtonClick = () => {
    if (user) {
      router.push('/recipes');
    } else {
      signInWithGoogle();
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Лендинг - показываем всем
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
        <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* YouTube видео или декоративные эмодзи */}
            {settings?.heroYoutubeUrl && getYouTubeVideoId(settings.heroYoutubeUrl) ? (
              <div className="mb-6 sm:mb-12 mx-auto opacity-0 animate-fade-in px-0 sm:px-4 max-w-4xl">
                <div className="rounded-none sm:rounded-2xl overflow-hidden bg-black shadow-2xl shadow-amber-500/10">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(settings.heroYoutubeUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeVideoId(settings.heroYoutubeUrl)}&rel=0&modestbranding=1&playsinline=1&controls=1`}
                      title="Промо видео"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 opacity-0 animate-fade-in">
                <span className="text-4xl sm:text-5xl animate-float">🍳</span>
                <span className="text-4xl sm:text-5xl animate-float delay-200">👨‍🍳</span>
                <span className="text-4xl sm:text-5xl animate-float delay-400">🔥</span>
              </div>
            )}

            <h1 className="font-display text-3xl sm:text-4xl md:text-[48px] font-bold mb-4 sm:mb-6 opacity-0 animate-fade-in delay-100 px-2">
              {(() => {
                const title = settings?.heroTitle || 'Станьте {{профессионалом}}';
                const match = title.match(/^(.*?)\{\{(.+?)\}\}(.*)$/);
                if (match) {
                  return (
                    <>
                      {match[1]}
                      <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                        {match[2]}
                      </span>
                      {match[3]}
                    </>
                  );
                }
                const words = title.split(' ');
                return (
                  <>
                    {words.slice(0, -1).join(' ')}{' '}
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                      {words.slice(-1)[0]}
                    </span>
                  </>
                );
              })()}
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-zinc-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in delay-200 px-2 whitespace-pre-line">
              {settings?.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center opacity-0 animate-fade-in delay-300 px-4 sm:px-0">
              {user ? (
                <Link
                  href="/recipes"
                  className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold text-base sm:text-lg rounded-xl transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <span>📖</span>
                  Смотреть рецепты
                </Link>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold text-base sm:text-lg rounded-xl transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
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
              )}

              {user ? (
                <button
                  onClick={() => setGiftModalOpen(true)}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-zinc-700 hover:border-amber-500/50 text-white font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 hover:bg-zinc-800/50 flex items-center justify-center gap-2"
                >
                  <span>🎁</span>
                  Подарить рецепт
                </button>
              ) : (
                <a
                  href="#preview"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-zinc-700 hover:border-zinc-600 text-white font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 hover:bg-zinc-800/50 flex items-center justify-center gap-2"
                >
                  Посмотреть рецепты
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Превью рецептов */}
        <section id="preview" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Новые <span className="text-amber-400">курсы</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto px-2">
                {user 
                  ? 'Выберите рецепт, чтобы начать обучение'
                  : isConfigured 
                    ? 'Войдите в аккаунт, чтобы получить доступ к полным видеоурокам'
                    : 'Настройте Firebase для включения авторизации и покупок'
                }
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {recipes.slice(-3).reverse().map((recipe) => (
                <article 
                  key={recipe.id} 
                  className="group relative bg-zinc-900/50 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/50 cursor-pointer hover:border-amber-500/30 transition-all active:scale-[0.98]"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className="relative h-40 sm:h-56 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
                    {recipe.coverImage ? (
                      <img 
                        src={recipe.coverImage} 
                        alt={recipe.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl opacity-30">
                        {recipe.category === 'Мясо' && '🥩'}
                        {recipe.category === 'Паста' && '🍝'}
                        {recipe.category === 'Десерты' && '🍮'}
                        {recipe.category === 'Японская кухня' && '🍣'}
                        {!recipe.category && '🍽️'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                        {user ? (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Подробнее
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {isConfigured ? 'Войдите для доступа' : 'Настройте Firebase'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{recipe.title}</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{recipe.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm sm:text-base">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}
                      </span>
                      <span className="text-zinc-500 text-xs sm:text-sm">{recipe.videos.length} видео</span>
                    </div>
                    {/* Кнопка купить */}
                    {user && !hasPurchased(recipe.id) && (
                      <button
                        onClick={(e) => handleBuyRecipe(e, recipe)}
                        disabled={buyingRecipeId === recipe.id}
                        className="mt-3 sm:mt-4 w-full py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-zinc-900 text-xs sm:text-sm font-bold rounded-lg transition-colors"
                      >
                        {buyingRecipeId === recipe.id ? 'Загрузка...' : `Купить за ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(recipe.price / 100)}`}
                      </button>
                    )}
                    {user && hasPurchased(recipe.id) && (
                      <div className="mt-3 sm:mt-4 w-full py-2 sm:py-2.5 bg-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-medium rounded-lg text-center flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Куплено
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {recipes.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={handleMainButtonClick}
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                >
                  {user ? 'Перейти в каталог' : 'Показать все рецепты'} ({recipes.length})
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
          <section className="py-12 sm:py-20 px-4 sm:px-6 bg-zinc-900/30">
            <div className="max-w-7xl mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                {settings.features.map((feature, index) => (
                  <div key={index} className="text-center p-4 sm:p-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl sm:text-3xl">
                      {feature.emoji}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {settings?.faq && settings.faq.length > 0 && (
          <FaqAccordion faq={settings.faq} />
        )}

        {/* Gift Modal */}
        <GiftModal 
          isOpen={giftModalOpen} 
          onClose={() => setGiftModalOpen(false)} 
        />

        {/* Gift Success Popup */}
        {giftSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setGiftSuccessOpen(false)}
            />
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Подарок отправлен!</h2>
              <p className="text-zinc-400 mb-6">
                Рецепт успешно куплен и подарен. Получатель сможет посмотреть его после входа в свой Google аккаунт.
              </p>
              <button
                onClick={() => setGiftSuccessOpen(false)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold rounded-xl transition-all"
              >
                Отлично!
              </button>
            </div>
          </div>
        )}

        </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
