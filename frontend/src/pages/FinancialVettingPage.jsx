import React, { useState } from 'react'
import { BadgeDollarSign, Save, Check, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import clsx from 'clsx'

export default function FinancialVettingPage() {
    const { user } = useAuthStore()
    const { menus, setMaxPrice, verifyStage } = useWorkflowStore()
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [prices, setPrices] = useState({})

    const pendingMenus = menus.filter(m => m.stages.accountant_review?.status === 'active')

    const selectMenu = (menu) => {
        setSelectedMenu(menu)
        const p = {}
        menu.ingredients.forEach((ing, i) => { p[i] = ing.maxPrice || '' })
        setPrices(p)
    }

    const handleSave = () => {
        const allSet = selectedMenu.ingredients.every((_, i) => prices[i] && parseFloat(prices[i]) > 0)
        if (!allSet) { toast.error('Semua harga max harus diisi!'); return }

        selectedMenu.ingredients.forEach((_, i) => {
            setMaxPrice(selectedMenu.id, i, parseFloat(prices[i]))
        })
        verifyStage(selectedMenu.id, 'accountant_review', user.name)
        toast.success('Harga max disimpan! Diteruskan ke SCD.')
        setSelectedMenu(null)
        setPrices({})
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <BadgeDollarSign size={24} /> Financial Vetting
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Tetapkan harga maksimum per unit untuk setiap bahan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Menu list */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50">
                        Menunggu Vetting ({pendingMenus.length})
                    </h3>
                    {pendingMenus.length === 0 ? (
                        <div className="card text-center py-8">
                            <Check size={32} className="mx-auto text-accent mb-2" />
                            <p className="text-sm text-gray-400">Semua sudah divetting</p>
                        </div>
                    ) : (
                        pendingMenus.map(menu => (
                            <div
                                key={menu.id}
                                onClick={() => selectMenu(menu)}
                                className={clsx(
                                    'card cursor-pointer transition-all border-2',
                                    selectedMenu?.id === menu.id ? 'border-primary shadow-lg' : 'border-transparent hover:border-accent'
                                )}
                            >
                                <p className="font-bold text-primary">{menu.name}</p>
                                <p className="text-xs text-tertiary/60 mt-0.5">{menu.targetDate} • {menu.ingredients.length} bahan</p>
                                <p className="text-xs text-secondary mt-1">Est. Cost: Rp {menu.estimatedCost?.toLocaleString('id-ID')}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Right: Side-by-side vetting */}
                <div>
                    {selectedMenu ? (
                        <div className="card sticky top-24">
                            <h3 className="font-bold text-primary text-sm mb-4">Vetting: {selectedMenu.name}</h3>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="table-header">Bahan</th>
                                        <th className="table-header">Qty</th>
                                        <th className="table-header">Unit</th>
                                        <th className="table-header">Max Harga/Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMenu.ingredients.map((ing, i) => (
                                        <tr key={i}>
                                            <td className="table-cell font-semibold">{ing.name}</td>
                                            <td className="table-cell text-primary font-bold">{ing.quantity}</td>
                                            <td className="table-cell text-tertiary/60">{ing.unit}</td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-tertiary/50">Rp</span>
                                                    <input
                                                        type="number"
                                                        value={prices[i] || ''}
                                                        onChange={e => setPrices({ ...prices, [i]: e.target.value })}
                                                        className="input-field w-28 text-sm py-1.5"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={handleSave} className="btn-primary w-full justify-center mt-4">
                                <Save size={16} /> Simpan & Kirim ke SCD
                            </button>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <Filter size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih menu dari daftar kiri</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
