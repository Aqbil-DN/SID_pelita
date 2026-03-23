import { create } from 'zustand'
import { DEMO_BENEFICIARIES } from '../lib/constants'

// Seed from DEMO_BENEFICIARIES — add default arrivalTime
const seed = DEMO_BENEFICIARIES.map(b => ({
    ...b,
    arrivalTime: '07:30',
}))

export const usePortionPlanningStore = create((set) => ({
    plans: seed,

    addPlan: (plan) =>
        set(state => ({
            plans: [...state.plans, { id: Date.now(), ...plan }],
        })),

    updatePlan: (id, updates) =>
        set(state => ({
            plans: state.plans.map(p => (p.id === id ? { ...p, ...updates } : p)),
        })),

    deletePlan: (id) =>
        set(state => ({
            plans: state.plans.filter(p => p.id !== id),
        })),
}))
