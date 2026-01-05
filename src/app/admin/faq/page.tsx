'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, saveSiteSettings, type FaqItem } from '@/lib/firestore';
import Link from 'next/link';

export default function AdminFaqPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faq, setFaq] = useState<FaqItem[]>([]);

  useEffect(() => {
    loadFaq();
  }, []);

  const loadFaq = async () => {
    const settings = await getSiteSettings();
    setFaq(settings.faq || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings({ faq });
      alert('FAQ сохранён!');
    } catch (error) {
      alert('Ошибка сохранения');
    }
    setSaving(false);
  };

  const addQuestion = () => {
    setFaq([...faq, { question: '', answer: '' }]);
  };

  const updateQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaq = [...faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    setFaq(newFaq);
  };

  const removeQuestion = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newFaq = [...faq];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faq.length) return;
    [newFaq[index], newFaq[newIndex]] = [newFaq[newIndex], newFaq[index]];
    setFaq(newFaq);
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
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1 transition-colors"
          >
            ← Назад
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">FAQ</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="space-y-4">
        {faq.map((item, index) => (
          <div
            key={index}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Вверх"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={index === faq.length - 1}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Вниз"
                >
                  ↓
                </button>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm mb-1.5">
                    Вопрос #{index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm sm:text-base focus:border-amber-500 focus:outline-none"
                    placeholder="Введите вопрос..."
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs sm:text-sm mb-1.5">
                    Ответ
                  </label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm sm:text-base focus:border-amber-500 focus:outline-none resize-none"
                    placeholder="Введите ответ..."
                  />
                </div>
              </div>

              <button
                onClick={() => removeQuestion(index)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Удалить"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {faq.length === 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 sm:p-12 text-center">
            <div className="text-5xl mb-4">❓</div>
            <h2 className="text-lg font-bold text-white mb-2">Нет вопросов</h2>
            <p className="text-zinc-400 text-sm mb-6">Добавьте первый вопрос для FAQ</p>
          </div>
        )}

        <button
          onClick={addQuestion}
          className="w-full py-3 sm:py-4 border-2 border-dashed border-zinc-700 hover:border-amber-500/50 rounded-xl text-zinc-400 hover:text-amber-400 transition-colors text-sm sm:text-base"
        >
          + Добавить вопрос
        </button>
      </div>
    </div>
  );
}

