'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPublishedRecipes, type Recipe } from '@/lib/firestore';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GiftModal({ isOpen, onClose }: GiftModalProps) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  
  const [errors, setErrors] = useState<{
    email?: string;
    confirmEmail?: string;
    recipe?: string;
    confirmed?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
      resetForm();
    }
  }, [isOpen]);

  const loadRecipes = async () => {
    setLoading(true);
    const data = await getPublishedRecipes();
    setRecipes(data);
    setLoading(false);
  };

  const resetForm = () => {
    setRecipientEmail('');
    setConfirmEmail('');
    setSelectedRecipeId('');
    setConfirmed(false);
    setErrors({});
  };

  const validateGmailEmail = (email: string): boolean => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!recipientEmail) {
      newErrors.email = 'Введите email получателя';
    } else if (!validateGmailEmail(recipientEmail)) {
      newErrors.email = 'Только Gmail адреса (@gmail.com)';
    }

    if (!confirmEmail) {
      newErrors.confirmEmail = 'Подтвердите email';
    } else if (recipientEmail !== confirmEmail) {
      newErrors.confirmEmail = 'Email адреса не совпадают';
    }

    if (!selectedRecipeId) {
      newErrors.recipe = 'Выберите рецепт';
    }

    if (!confirmed) {
      newErrors.confirmed = 'Подтвердите правильность данных';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
  const isSelfGift = recipientEmail.toLowerCase() === user?.email?.toLowerCase();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(price / 100);
  };

  const handleSubmit = async () => {
    if (!validate() || !user || !selectedRecipe) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: selectedRecipe.id,
          recipeTitle: selectedRecipe.title,
          recipeDescription: `Подарок для ${recipientEmail}`,
          price: selectedRecipe.price,
          userId: user.uid,
          userEmail: user.email,
          isGift: true,
          recipientEmail: recipientEmail.toLowerCase(),
          isSelfGift,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Ошибка создания сессии:', error);
        alert('Произошла ошибка. Попробуйте позже.');
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎁</span> Подарить рецепт
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Email получателя */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email получателя (только Gmail)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    errors.email ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
                {isSelfGift && recipientEmail && (
                  <p className="mt-1 text-sm text-amber-400">Это ваш email — рецепт будет куплен для вас</p>
                )}
              </div>

              {/* Подтверждение email */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Подтвердите email
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    errors.confirmEmail ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {errors.confirmEmail && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmEmail}</p>
                )}
              </div>

              {/* Выбор рецепта */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Выберите рецепт
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    errors.recipe ? 'border-red-500' : 'border-zinc-700'
                  }`}
                >
                  <option value="">— Выберите рецепт —</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title} — {formatPrice(recipe.price)}
                    </option>
                  ))}
                </select>
                {errors.recipe && (
                  <p className="mt-1 text-sm text-red-400">{errors.recipe}</p>
                )}
              </div>

              {/* Информация о выбранном рецепте */}
              {selectedRecipe && (
                <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{selectedRecipe.title}</h3>
                    <span className="text-amber-400 font-bold">{formatPrice(selectedRecipe.price)}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{selectedRecipe.shortDescription}</p>
                  <p className="text-xs text-zinc-500 mt-2">{selectedRecipe.videos.length} видео</p>
                </div>
              )}

              {/* Галочка подтверждения */}
              <div>
                <label className={`flex items-start gap-3 cursor-pointer ${errors.confirmed ? 'text-red-400' : 'text-zinc-300'}`}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span className="text-sm">
                    Я проверил(а) email получателя и подтверждаю, что все данные верны
                  </span>
                </label>
                {errors.confirmed && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmed}</p>
                )}
              </div>

              {/* Кнопка оплаты */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Переход к оплате...
                  </>
                ) : (
                  <>
                    <span>🎁</span>
                    Подарить{selectedRecipe ? ` за ${formatPrice(selectedRecipe.price)}` : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
