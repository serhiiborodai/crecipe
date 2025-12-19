'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Админские email из переменных окружения
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  purchases: string[];
  isAdmin: boolean;
  isConfigured: boolean; // Firebase настроен?
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPurchased: (recipeId: string) => boolean;
  refreshPurchases: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIsAdmin = (email: string | null): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
  };

  const loadPurchases = async (userId: string) => {
    if (!db) return;
    
    try {
      const purchasesRef = collection(db, 'purchases');
      const q = query(purchasesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const purchasedRecipes: string[] = [];
      querySnapshot.forEach((doc) => {
        purchasedRecipes.push(doc.data().recipeId);
      });
      
      setPurchases(purchasedRecipes);
    } catch (error) {
      console.error('Ошибка загрузки покупок:', error);
    }
  };

  const refreshPurchases = async () => {
    if (user) {
      await loadPurchases(user.uid);
    }
  };

  useEffect(() => {
    // Если Firebase не настроен — сразу завершаем загрузку
    if (!isFirebaseConfigured || !auth) {
      console.warn('Firebase не настроен. Авторизация недоступна.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        setIsAdmin(checkIsAdmin(user.email));
        
        if (db) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLogin: new Date(),
            }, { merge: true });
          } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
          }
          
          await loadPurchases(user.uid);
        }
      } else {
        setPurchases([]);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      alert('Firebase не настроен. Смотри инструкцию в SETUP.md');
      return;
    }
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      setPurchases([]);
      setIsAdmin(false);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  };

  const hasPurchased = (recipeId: string): boolean => {
    // Админ имеет доступ ко всем рецептам
    if (isAdmin) return true;
    return purchases.includes(recipeId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        purchases,
        isAdmin,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        logout,
        hasPurchased,
        refreshPurchases,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}
