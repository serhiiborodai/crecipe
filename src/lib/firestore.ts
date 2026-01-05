import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

// ==================== ТИПЫ ====================

export interface RecipeVideo {
  id: string;
  title: string;
  vimeoId: string;
  description?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  priceId?: string;
  coverImage: string;
  youtubePromoUrl?: string;
  videos: RecipeVideo[];
  ingredients?: string[];
  cookingTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroYoutubeUrl?: string;
  footerText: string;
  features: {
    title: string;
    description: string;
    emoji: string;
  }[];
  categories: string[];
  recipesPerPage: number;
}

// ==================== ДЕМО-ДАННЫЕ ====================

const DEMO_RECIPES: Recipe[] = [
  {
    id: 'perfect-steak',
    title: 'Идеальный стейк Рибай',
    description: `Полный мастер-класс по приготовлению идеального стейка. 

В этом курсе вы узнаете:
- Как правильно выбрать мясо
- Секреты подготовки стейка
- Техника обжарки на сковороде
- Отдых мяса и подача
- 3 фирменных соуса`,
    shortDescription: 'Научитесь готовить идеальный стейк Рибай как в лучших стейк-хаусах.',
    price: 999, // $9.99
    coverImage: '',
    youtubePromoUrl: '',
    videos: [
      { id: 'steak-1', title: 'Часть 1: Выбор и подготовка мяса', vimeoId: '76979871', description: 'Как выбрать идеальный кусок мяса' },
      { id: 'steak-2', title: 'Часть 2: Техника обжарки', vimeoId: '76979871', description: 'Идеальная корочка и контроль прожарки' },
      { id: 'steak-3', title: 'Часть 3: Отдых и подача', vimeoId: '76979871', description: 'Почему отдых мяса так важен' },
    ],
    ingredients: ['Стейк Рибай 400г', 'Сливочное масло', 'Чеснок', 'Тимьян', 'Розмарин'],
    cookingTime: '30 минут',
    difficulty: 'medium',
    category: 'Мясо',
    order: 1,
    isPublished: true,
  },
  {
    id: 'homemade-pasta',
    title: 'Домашняя паста с нуля',
    description: `Научитесь делать настоящую итальянскую пасту своими руками.`,
    shortDescription: 'Настоящая итальянская паста своими руками. Тальятелле, равиоли и ньокки.',
    price: 1499, // $14.99
    coverImage: '',
    videos: [
      { id: 'pasta-1', title: 'Базовое тесто для пасты', vimeoId: '76979871', description: 'Идеальные пропорции' },
      { id: 'pasta-2', title: 'Тальятелле', vimeoId: '76979871', description: 'Классическая ленточная паста' },
    ],
    ingredients: ['Мука 00', 'Яйца', 'Оливковое масло', 'Соль'],
    cookingTime: '2 часа',
    difficulty: 'hard',
    category: 'Паста',
    order: 2,
    isPublished: true,
  },
  {
    id: 'french-desserts',
    title: 'Французские десерты',
    description: `Три культовых французских десерта для дома.`,
    shortDescription: 'Крем-брюле, фондан и тарт татен — три жемчужины французской кухни.',
    price: 799, // $7.99
    coverImage: '',
    videos: [
      { id: 'dessert-1', title: 'Крем-брюле', vimeoId: '76979871', description: 'Нежный крем и хрустящая карамель' },
      { id: 'dessert-2', title: 'Шоколадный фондан', vimeoId: '76979871', description: 'Тающая серединка' },
    ],
    ingredients: ['Сливки', 'Сахар', 'Яйца', 'Ваниль', 'Шоколад'],
    cookingTime: '1.5 часа',
    difficulty: 'medium',
    category: 'Десерты',
    order: 3,
    isPublished: true,
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: 'Готовьте как профессионал',
  heroSubtitle: 'ChefRecipes',
  heroDescription: 'Эксклюзивные видеорецепты и мастер-классы от шеф-повара. Пошаговые инструкции, секреты техники и авторские соусы — всё для того, чтобы ваши блюда стали ресторанного уровня.',
  heroYoutubeUrl: '',
  footerText: '© 2024 ChefRecipes. Все права защищены.',
  features: [
    { title: 'HD Видео', description: 'Качественные видеоуроки с близкими ракурсами', emoji: '🎬' },
    { title: 'Подробные рецепты', description: 'Полный список ингредиентов и пошаговые инструкции', emoji: '📝' },
    { title: 'Пожизненный доступ', description: 'Купите один раз — пересматривайте сколько угодно', emoji: '♾️' },
  ],
  categories: ['Мясо', 'Паста', 'Десерты', 'Выпечка', 'Супы', 'Салаты', 'Морепродукты'],
  recipesPerPage: 12,
};

// ==================== РЕЦЕПТЫ ====================

const RECIPES_COLLECTION = 'recipes';
const SETTINGS_COLLECTION = 'settings';

export async function getAllRecipes(): Promise<Recipe[]> {
  // Если Firebase не настроен — возвращаем демо-данные
  if (!isFirebaseConfigured || !db) {
    return DEMO_RECIPES;
  }

  try {
    const recipesRef = collection(db, RECIPES_COLLECTION);
    const q = query(recipesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Recipe[];
    
    // Если в базе пусто — возвращаем демо
    return recipes.length > 0 ? recipes : DEMO_RECIPES;
  } catch (error) {
    console.error('Ошибка получения рецептов:', error);
    return DEMO_RECIPES;
  }
}

export async function getPublishedRecipes(): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  return recipes.filter(r => r.isPublished !== false);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  // Если Firebase не настроен — ищем в демо-данных
  if (!isFirebaseConfigured || !db) {
    return DEMO_RECIPES.find(r => r.id === id) || null;
  }

  try {
    const docRef = doc(db, RECIPES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      // Может быть в демо-данных
      return DEMO_RECIPES.find(r => r.id === id) || null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Recipe;
  } catch (error) {
    console.error('Ошибка получения рецепта:', error);
    return DEMO_RECIPES.find(r => r.id === id) || null;
  }
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase не настроен. Сохранение невозможно.');
    throw new Error('Firebase не настроен');
  }

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipe.id);
    await setDoc(docRef, {
      ...recipe,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Ошибка сохранения рецепта:', error);
    throw error;
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase не настроен');
  }

  try {
    const docRef = doc(db, RECIPES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Ошибка удаления рецепта:', error);
    throw error;
  }
}

// ==================== НАСТРОЙКИ САЙТА ====================

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isFirebaseConfigured || !db) {
    return DEFAULT_SETTINGS;
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'site');
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return DEFAULT_SETTINGS;
    }
    
    return {
      ...DEFAULT_SETTINGS,
      ...snapshot.data(),
    } as SiteSettings;
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase не настроен');
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'site');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    throw error;
  }
}

// Функция инициализации больше не нужна — используем демо-данные по умолчанию
export async function initializeDemoData(): Promise<void> {
  // Теперь демо-данные возвращаются автоматически если Firebase не настроен
  // или если база пустая
}
