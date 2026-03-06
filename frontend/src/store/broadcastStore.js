import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_BROADCASTS } from '../lib/constants'

const useBroadcastStore = create(
    persist(
        (set, get) => ({
            messages: [...DEMO_BROADCASTS],

            addMessage: (msg) =>
                set((s) => ({
                    messages: [
                        { ...msg, id: Date.now(), createdAt: new Date().toISOString() },
                        ...s.messages,
                    ],
                })),

            removeMessage: (id) =>
                set((s) => ({
                    messages: s.messages.filter((m) => m.id !== id),
                })),

            getActiveMessages: () => {
                const now = new Date()
                return get().messages.filter((m) => {
                    const created = new Date(m.createdAt)
                    const expiresAt = new Date(created.getTime() + m.duration * 60 * 60 * 1000)
                    return expiresAt > now
                })
            },
        }),
        { name: 'mbg-broadcasts' }
    )
)

export default useBroadcastStore
