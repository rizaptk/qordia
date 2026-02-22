import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MenuItem } from '@/lib/types';


interface MenuState {
    menus: MenuItem[];
    addMenu: (menu: MenuItem) => void;
    setMenus: (menus: MenuItem[]) => void;
    getMenu: (menuId: string) => MenuItem | undefined;
    getMenus: (menuIds: string[]) => MenuItem[];
    removeMenu: (menuId: string) => void;
    updateMenu: (menuId: string, updatedData: Partial<MenuItem>) => void;
    clearMenus: () => void;
    totalMenus: () => number;
}

export const useMenuStore = create<MenuState>()(
    persist(
        (set, get) => ({  
            menus: [],
            addMenu: (menu) => {
                set((state) => ({ menus: [...state.menus, menu] }));
            },
            setMenus: (menus) => {
                set({ menus: menus });
            },
            getMenu: (menuId) => {
                const { menus } = get();
                return menus.find((item) => item.id === menuId);
            },
            getMenus: (menuIds) => {
                const { menus } = get();
                return menus.filter((item) => menuIds.includes(item.id));
            },
            removeMenu: (menuId) => {
                set((state) => ({
                    menus: state.menus.filter((item) => item.id !== menuId),
                }));
            },
            updateMenu: (menuId, updatedData) => {
                set((state) => ({
                    menus: state.menus.map((item) =>
                        item.id === menuId ? { ...item, ...updatedData } : item
                    ),
                }));
            },
            clearMenus: () => set({ menus: [] }),
            totalMenus: () => {
                const { menus } = get();
                return menus.length;
            },
        })
        ,
        {
            name: 'qordia-menu-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)