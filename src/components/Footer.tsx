'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/firestore';

export default function Footer() {
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSiteSettings();
      setFooterText(settings.footerText);
    };
    loadSettings();
  }, []);

  return (
    <footer className="py-8 sm:py-12 px-6 border-t border-zinc-800/50 mt-auto">
      <div className="max-w-7xl mx-auto text-center text-zinc-500 text-sm">
        <p>{footerText || '© ChefRecipes. Все права защищены.'}</p>
      </div>
    </footer>
  );
}

