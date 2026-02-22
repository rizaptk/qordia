import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MenuCategory } from '@/lib/types';

interface CategoryState {
    categories: MenuCategory[];
    addCategory: (category: MenuCategory) => void;
    setCategories: (categories: MenuCategory[]) => void;
    getCategory: (categoryId: string) => MenuCategory | undefined;
    getCategories: (categoryIds: string[]) => MenuCategory[];
    removeCategory: (categoryId: string) => void;
    updateCategory: (categoryId: string, updatedData: Partial<MenuCategory>) => void;
    clearCategories: () => void;
    totalCategories: () => number;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: [],
            addCategory: (category) => {
                set((state) => ({ categories: [...state.categories, category] }));
            },
            setCategories: (categories) => {
                set({ categories: categories });
            },
            getCategory: (categoryId) => {
                const { categories } = get();
                return categories.find((item) => item.id === categoryId);
            },
            getCategories: (categoryIds) => {
                const { categories } = get();
                return categories.filter((item) => categoryIds.includes(item.id));
            },
            removeCategory: (categoryId) => {
                set((state) => ({
                    categories: state.categories.filter((item) => item.id !== categoryId),
                }));
            },
            updateCategory: (categoryId, updatedData) => {
                set((state) => ({
                    categories: state.categories.map((item) =>
                        item.id === categoryId ? { ...item, ...updatedData } : item
                    ),
                }));
            },
            clearCategories: () => set({ categories: [] }),
            totalCategories: () => {
                const { categories } = get();
                return categories.length;
            },
        }),
        {
            name: 'qordia-category-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)