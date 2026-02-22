'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getReviewsForRecipe,
  getUserReviewForRecipe,
  addReview,
  deleteReview,
  type Review,
} from '@/lib/firestore';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface ReviewsProps {
  recipeId: string;
}

export default function Reviews({ recipeId }: ReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadReviews = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getReviewsForRecipe(
        recipeId,
        10,
        reset ? undefined : lastDoc || undefined
      );

      if (reset) {
        setReviews(result.reviews);
      } else {
        setReviews(prev => [...prev, ...result.reviews]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [recipeId, lastDoc]);

  const loadUserReview = useCallback(async () => {
    if (!user) {
      setUserReview(null);
      return;
    }

    try {
      const review = await getUserReviewForRecipe(recipeId, user.uid);
      setUserReview(review);
    } catch (error) {
      console.error('Ошибка загрузки отзыва пользователя:', error);
    }
  }, [recipeId, user]);

  useEffect(() => {
    loadReviews(true);
  }, [recipeId]);

  useEffect(() => {
    loadUserReview();
  }, [loadUserReview]);

  const handleSubmitReview = async () => {
    if (!user || !newReviewText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addReview({
        recipeId,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Пользователь',
        userPhoto: user.photoURL || undefined,
        text: newReviewText.trim(),
      });

      setNewReviewText('');
      await loadUserReview();
      await loadReviews(true);
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setDeleteConfirm(null);
      setUserReview(null);
      await loadReviews(true);
    } catch (error) {
      console.error('Ошибка удаления отзыва:', error);
      alert('Ошибка при удалении отзыва');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="mt-8 sm:mt-12 p-5 sm:p-8 bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-zinc-800/50">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl">💬</span> Отзывы
      </h2>

      {/* Форма добавления отзыва */}
      {user && !userReview && (
        <div className="mb-6 sm:mb-8">
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Напишите ваш отзыв о курсе..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition-colors resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmitReview}
              disabled={!newReviewText.trim() || submitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-bold rounded-lg transition-colors"
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      )}

      {/* Сообщение если пользователь уже оставил отзыв */}
      {user && userReview && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-sm">
            Вы уже оставили отзыв к этому курсу
          </p>
        </div>
      )}

      {/* Сообщение для незалогиненных */}
      {!user && (
        <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <p className="text-zinc-400 text-sm">
            Войдите, чтобы оставить отзыв
          </p>
        </div>
      )}

      {/* Список отзывов */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-zinc-500">Пока нет отзывов. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="relative p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30"
            >
              {/* Кнопка удаления для своего отзыва */}
              {user && review.userId === user.uid && (
                <button
                  onClick={() => setDeleteConfirm(review.id)}
                  className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Удалить отзыв"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="flex items-start gap-3">
                {/* Аватар */}
                <div className="flex-shrink-0">
                  {review.userPhoto ? (
                    <img
                      src={review.userPhoto}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{review.userName}</span>
                    <span className="text-zinc-500 text-xs">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm whitespace-pre-line">{review.text}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Кнопка загрузить ещё */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => loadReviews(false)}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                {loadingMore ? 'Загрузка...' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-3">Удалить отзыв?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Вы уверены, что хотите удалить свой отзыв? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteReview(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-lg transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
