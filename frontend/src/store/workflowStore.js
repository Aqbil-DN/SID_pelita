import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_MENUS } from '../lib/constants'

const useWorkflowStore = create(
    persist(
        (set, get) => ({
            menus: [...DEMO_MENUS],

            // ── Getters ──────────────────────────────────────
            getMenuById: (id) => get().menus.find((m) => m.id === id),

            getMenusByDate: (dateStr) => get().menus.filter((m) => m.targetDate === dateStr),

            getMenusByStage: (stageKey) =>
                get().menus.filter((m) => m.stages[stageKey]?.status === 'active'),

            // ── Menu CRUD ────────────────────────────────────
            addMenu: (menu) =>
                set((s) => ({
                    menus: [...s.menus, { ...menu, id: Date.now() }],
                })),

            deleteMenu: (id) =>
                set((s) => ({
                    menus: s.menus.filter((m) => m.id !== id),
                })),

            updateMenu: (id, updates) =>
                set((s) => ({
                    menus: s.menus.map((m) => (m.id === id ? { ...m, ...updates } : m)),
                })),

            // ── Stage transitions ────────────────────────────
            verifyStage: (menuId, stageKey, processedBy) =>
                set((s) => {
                    const stageKeys = Object.keys(s.menus[0]?.stages || {})
                    const currentIdx = stageKeys.indexOf(stageKey)
                    const nextKey = stageKeys[currentIdx + 1]

                    return {
                        menus: s.menus.map((m) => {
                            if (m.id !== menuId) return m
                            const stages = { ...m.stages }
                            stages[stageKey] = {
                                ...stages[stageKey],
                                status: 'done',
                                completedAt: new Date().toISOString(),
                                processedBy,
                            }
                            if (nextKey) {
                                stages[nextKey] = { ...stages[nextKey], status: 'active' }
                            }
                            return {
                                ...m,
                                stages,
                                currentStage: Math.min(m.currentStage + 1, stageKeys.length),
                            }
                        }),
                    }
                }),

            ignoreStage: (menuId, stageKey, reason, processedBy) =>
                set((s) => {
                    // "Ignore" sends back to previous stage
                    const stageKeys = Object.keys(s.menus[0]?.stages || {})
                    const currentIdx = stageKeys.indexOf(stageKey)
                    const prevKey = stageKeys[Math.max(0, currentIdx - 1)]

                    return {
                        menus: s.menus.map((m) => {
                            if (m.id !== menuId) return m
                            const stages = { ...m.stages }
                            stages[stageKey] = {
                                ...stages[stageKey],
                                status: 'rejected',
                                rejectedAt: new Date().toISOString(),
                                rejectedBy: processedBy,
                                rejectReason: reason,
                            }
                            if (prevKey && prevKey !== stageKey) {
                                stages[prevKey] = { ...stages[prevKey], status: 'active', completedAt: null }
                            }
                            return {
                                ...m,
                                stages,
                                currentStage: Math.max(1, m.currentStage - 1),
                            }
                        }),
                    }
                }),

            // ── Ingredients ──────────────────────────────────
            setIngredients: (menuId, ingredients) =>
                set((s) => ({
                    menus: s.menus.map((m) =>
                        m.id === menuId ? { ...m, ingredients } : m
                    ),
                })),

            setMaxPrice: (menuId, ingredientIdx, maxPrice) =>
                set((s) => ({
                    menus: s.menus.map((m) => {
                        if (m.id !== menuId) return m
                        const ingredients = [...m.ingredients]
                        ingredients[ingredientIdx] = { ...ingredients[ingredientIdx], maxPrice }
                        return { ...m, ingredients }
                    }),
                })),

            // ── Vendors ──────────────────────────────────────
            addVendor: (menuId, vendor) =>
                set((s) => ({
                    menus: s.menus.map((m) =>
                        m.id === menuId ? { ...m, vendors: [...(m.vendors || []), vendor] } : m
                    ),
                })),

            // ── Receiving ────────────────────────────────────
            addReceiving: (menuId, data) =>
                set((s) => ({
                    menus: s.menus.map((m) =>
                        m.id === menuId ? { ...m, receiving: [...(m.receiving || []), data] } : m
                    ),
                })),

            // ── Production Stage ─────────────────────────────
            setProductionStage: (menuId, stage) =>
                set((s) => ({
                    menus: s.menus.map((m) =>
                        m.id === menuId ? { ...m, productionStage: stage } : m
                    ),
                })),
        }),
        { name: 'mbg-workflow' }
    )
)

export default useWorkflowStore
