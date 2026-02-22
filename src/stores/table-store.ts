import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Table } from '@/lib/types';

interface TableState {
  tables: Table[];
  addTable: (table: Table) => void;
  setTables: (tables: Table[]) => void;
  getTable: (tableId: string) => Table | undefined;
  getTables: (tableIds: string[]) => Table[];
  removeTable: (tableId: string) => void;
  updateTable: (tableId: string, updatedData: Partial<Table>) => void;
  clearTables: () => void;
  totalTables: () => number;
}

export const useTableStore = create<TableState>()(
    persist((set, get) => ({
            tables: [],
            addTable: (table) => {
                set((state) => ({ tables: [...state.tables, table] }));
            },
            setTables: (tables) => {
                set({ tables: tables });
            },  
            getTable: (tableId) => {
                const { tables } = get();
                return tables.find((item) => item.id === tableId);
            },
            getTables: (tableIds) => {
                const { tables } = get();
                return tables.filter((item) => tableIds.includes(item.id));
            },
            removeTable: (tableId) => {
                set((state) => ({
                    tables: state.tables.filter((item) => item.id !== tableId),
                }));
            },
            updateTable: (tableId, updatedData) => {
                set((state) => ({
                    tables: state.tables.map((item) =>
                        item.id === tableId ? { ...item, ...updatedData } : item
                    ),
                }));
            },
            clearTables: () => set({ tables: [] }), 
            totalTables: () => {
                const { tables } = get();
                return tables.length;
            },
        }),
        {
            name: 'qordia-table-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)