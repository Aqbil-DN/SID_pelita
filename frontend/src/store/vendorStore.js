import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEMO_VENDORS = [
    { id: 1, name: 'CV Sembako Jaya', location: 'Pasar Induk Kramatjati, Jakarta Timur', pic: 'Pak Hendra', phone: '0812-1111-2222' },
    { id: 2, name: 'PT Broiler Nusantara', location: 'Kawasan Industri Cikarang', pic: 'Ibu Susi', phone: '0813-2222-3333' },
    { id: 3, name: 'CV Mitra Ternak', location: 'Jalan Raya Bogor KM 24', pic: 'Pak Agus', phone: '0814-3333-4444' },
    { id: 4, name: 'UD Bumbu Nusantara', location: 'Pasar Kebayoran Lama, Jakarta Selatan', pic: 'Ibu Dewi', phone: '0815-4444-5555' },
    { id: 5, name: 'TPI Muara Baru', location: 'Pelabuhan Muara Baru, Jakarta Utara', pic: 'Pak Dedi', phone: '0816-5555-6666' },
]

const useVendorStore = create(
    persist(
        (set, get) => ({
            vendors: [...DEMO_VENDORS],

            addVendor: (vendor) =>
                set((s) => ({
                    vendors: [...s.vendors, { ...vendor, id: Date.now() }],
                })),

            updateVendor: (id, updates) =>
                set((s) => ({
                    vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
                })),

            deleteVendor: (id) =>
                set((s) => ({
                    vendors: s.vendors.filter((v) => v.id !== id),
                })),
        }),
        { name: 'mbg-vendors' }
    )
)

export default useVendorStore
