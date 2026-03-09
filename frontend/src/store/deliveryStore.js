import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_DELIVERIES, DEMO_SCHOOLS } from '../lib/constants'

const STATUS_ORDER = ['loading', 'on_delivery', 'arrived', 'pick_up']

const useDeliveryStore = create(
    persist(
        (set, get) => ({
            deliveries: DEMO_DELIVERIES.map((d) => ({
                ...d,
                school: DEMO_SCHOOLS.find((s) => s.id === d.schoolId),
                incidents: [],
            })),

            advanceStatus: (id) =>
                set((s) => ({
                    deliveries: s.deliveries.map((d) => {
                        if (d.id !== id) return d
                        const idx = STATUS_ORDER.indexOf(d.status)
                        if (idx >= STATUS_ORDER.length - 1) return d
                        const newStatus = STATUS_ORDER[idx + 1]
                        const progress = Math.round(((idx + 2) / STATUS_ORDER.length) * 100)
                        return { ...d, status: newStatus, progress }
                    }),
                })),

            revertStatus: (id) =>
                set((s) => ({
                    deliveries: s.deliveries.map((d) => {
                        if (d.id !== id) return d
                        const idx = STATUS_ORDER.indexOf(d.status)
                        if (idx <= 0) return d
                        const newStatus = STATUS_ORDER[idx - 1]
                        const progress = Math.round(((idx) / STATUS_ORDER.length) * 100)
                        return { ...d, status: newStatus, progress }
                    }),
                })),

            addIncident: (id, description) =>
                set((s) => ({
                    deliveries: s.deliveries.map((d) =>
                        d.id !== id
                            ? d
                            : {
                                  ...d,
                                  incidents: [
                                      ...(d.incidents || []),
                                      { description, reportedAt: new Date().toISOString() },
                                  ],
                              }
                    ),
                })),

            getDeliveries: () => get().deliveries,
        }),
        { name: 'mbg-delivery' }
    )
)

export default useDeliveryStore
