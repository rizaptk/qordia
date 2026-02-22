import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ModifierGroup } from '@/lib/types';

interface ModifierGroupState {
  modifierGroups: ModifierGroup[];
  addModifierGroup: (modifierGroup: ModifierGroup) => void;
  setModifierGroups: (modifierGroups: ModifierGroup[]) => void;
  getModifierGroup: (modifierGroupId: string) => ModifierGroup | undefined;
  getModifierGroups: (modifierGroupIds: string[]) => ModifierGroup[];
  removeModifierGroup: (modifierGroupId: string) => void;
  updateModifierGroup: (modifierGroupId: string, updatedData: Partial<ModifierGroup>) => void;
  clearModifierGroups: () => void;
  totalModifierGroups: () => number;
}

export const useModifierGroupStore = create<ModifierGroupState>()(
    persist((set, get) => ({
        modifierGroups: [],
        addModifierGroup: (modifierGroup) => {
            set((state) => ({ modifierGroups: [...state.modifierGroups, modifierGroup] }));
        },
        setModifierGroups: (modifierGroups) => {
            set({ modifierGroups: modifierGroups });
        },
        getModifierGroup: (modifierGroupId) => {
            const { modifierGroups } = get();
            return modifierGroups.find((item) => item.id === modifierGroupId);
        },
        getModifierGroups: (modifierGroupIds) => {
            const { modifierGroups } = get();
            return modifierGroups.filter((item) => modifierGroupIds.includes(item.id));
        },
        removeModifierGroup: (modifierGroupId) => {
            set((state) => ({
                modifierGroups: state.modifierGroups.filter((item) => item.id !== modifierGroupId),
            }));
        },
        updateModifierGroup: (modifierGroupId, updatedData) => {
            set((state) => ({
                modifierGroups: state.modifierGroups.map((item) =>
                    item.id === modifierGroupId ? { ...item, ...updatedData } : item
                ),
            }));
        },
        clearModifierGroups: () => set({ modifierGroups: [] }),
        totalModifierGroups: () => {
            const { modifierGroups } = get();
            return modifierGroups.length;
        },
    }),
    {
        name: 'qordia-modifier-group-storage',
        storage: createJSONStorage(() => localStorage),
    }
))

