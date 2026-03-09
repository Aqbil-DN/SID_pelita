import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePettyCashStore = create(
    persist(
        (set) => ({
            entries: [],

            addEntry: (entry) =>
                set((s) => ({
                    entries: [
                        ...s.entries,
                        {
                            ...entry,
                            id: Date.now(),
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updateEntry: (id, updates) =>
                set((s) => ({
                    entries: s.entries.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                })),

            deleteEntry: (id) =>
                set((s) => ({
                    entries: s.entries.filter((e) => e.id !== id),
                })),
        }),
        { name: 'mbg-petty-cash' }
    )
)

export default usePettyCashStore
