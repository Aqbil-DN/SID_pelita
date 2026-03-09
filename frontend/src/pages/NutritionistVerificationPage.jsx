import React, { useState } from 'react'
import { CheckSquare, Check, X, Eye, AlertCircle, Flame } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import clsx from 'clsx'

export default function NutritionistVerificationPage() {
    const { user } = useAuthStore()
    const { menus, verifyStage, ignoreStage, setIngredients } = useWorkflowStore()
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [calorieInputs, setCalorieInputs] = useState({})

    // Menus awaiting nutritionist review (after HC mapped ingredients)
    const pendingMenus = menus.filter(m => m.stages.nutritionist_review?.status === 'active')
    const reviewedMenus = menus.filter(m =>
        m.stages.nutritionist_review?.status === 'done' || m.stages.nutritionist_review?.status === 'rejected'
    )

    const handleVerify = (menuId) => {
        // Persist calorie values onto ingredients
        const menu = menus.find(m => m.id === menuId)
        if (menu) {
            const updated = menu.ingredients.map((ing, i) => ({
                ...ing,
                calories: calorieInputs[i] !== undefined ? parseFloat(calorieInputs[i]) || 0 : (ing.calories || 0),
            }))
            setIngredients(menuId, updated)
        }
        verifyStage(menuId, 'nutritionist_review', user.name)
        toast.success('Bahan diverifikasi! Data diteruskan ke Accountant.')
        setSelectedMenu(null)
        setCalorieInputs({})
    }

    const handleIgnore = (menuId) => {
        if (!rejectReason.trim()) {
            toast.error('Alasan penolakan wajib diisi!')
            return
        }
        ignoreStage(menuId, 'nutritionist_review', rejectReason, user.name)
        toast.warning('Dikembalikan ke Head Chef untuk revisi.')
        setShowRejectModal(false)
        setRejectReason('')
        setSelectedMenu(null)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <CheckSquare size={24} /> Verifikasi Bahan
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Review desain bahan dari Head Chef</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: pending list */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50">
                        Menunggu Review ({pendingMenus.length})
                    </h3>
                    {pendingMenus.length === 0 ? (
                        <div className="card text-center py-8">
                            <Check size={32} className="mx-auto text-accent mb-2" />
                            <p className="text-sm text-gray-400">Semua sudah diverifikasi</p>
                        </div>
                    ) : (
                        pendingMenus.map(menu => (
                            <div
                                key={menu.id}
                                onClick={() => setSelectedMenu(menu)}
                                className={clsx(
                                    'card cursor-pointer transition-all border-2',
                                    selectedMenu?.id === menu.id ? 'border-primary shadow-lg' : 'border-transparent hover:border-accent'
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-primary">{menu.name}</p>
                                        <p className="text-xs text-tertiary/60 mt-0.5">{menu.targetDate} • {menu.calories} kcal</p>
                                    </div>
                                    <span className="badge-warning">Menunggu</span>
                                </div>
                                <p className="text-xs text-tertiary/60 mt-2">{menu.ingredients.length} bahan diajukan oleh {menu.stages.ingredient_mapping?.processedBy || 'HC'}</p>
                            </div>
                        ))
                    )}

                    {/* History */}
                    {reviewedMenus.length > 0 && (
                        <>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50 mt-6">
                                Riwayat
                            </h3>
                            {reviewedMenus.map(menu => (
                                <div key={menu.id} className="card opacity-60">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm text-tertiary">{menu.name}</p>
                                        {menu.stages.nutritionist_review?.status === 'done'
                                            ? <span className="badge-success">Verified</span>
                                            : <span className="badge-danger">Rejected</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Right: detail / side-by-side */}
                <div>
                    {selectedMenu ? (
                        <div className="card sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-primary flex items-center gap-2">
                                    <Eye size={16} /> Detail Review
                                </h3>
                                <button onClick={() => setSelectedMenu(null)} className="text-gray-400 hover:text-red-400"><X size={16} /></button>
                            </div>

                            <div className="mb-4 p-3 rounded-xl bg-accent-light/30">
                                <p className="font-bold text-primary text-sm">{selectedMenu.name}</p>
                                <p className="text-xs text-tertiary/60 mt-1">{selectedMenu.description}</p>
                                <p className="text-xs mt-2"><span className="font-semibold text-secondary">Target:</span> {selectedMenu.targetDate} • {selectedMenu.calories} kcal</p>
                            </div>

                            {/* Ingredient table */}
                            <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Daftar Bahan dari Head Chef</p>
                            {selectedMenu.ingredients.length === 0 ? (
                                <p className="text-sm text-gray-400 italic py-4 text-center">Belum ada bahan</p>
                            ) : (
                                <table className="w-full text-sm mb-4">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="table-header">Bahan</th>
                                            <th className="table-header">Qty</th>
                                            <th className="table-header">Unit</th>
                                            <th className="table-header"><span className="flex items-center gap-1"><Flame size={12} className="text-red-500" /> Kalori (kcal)</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedMenu.ingredients.map((ing, i) => (
                                            <tr key={i}>
                                                <td className="table-cell font-semibold">{ing.name}</td>
                                                <td className="table-cell text-primary font-bold">{ing.quantity}</td>
                                                <td className="table-cell text-tertiary/60">{ing.unit}</td>
                                                <td className="table-cell">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        className="input-field text-sm w-24"
                                                        value={calorieInputs[i] !== undefined ? calorieInputs[i] : (ing.calories || '')}
                                                        onChange={e => setCalorieInputs(prev => ({ ...prev, [i]: e.target.value }))}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleVerify(selectedMenu.id)}
                                    className="btn-primary flex-1 justify-center"
                                >
                                    <Check size={16} /> Verify
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="btn-danger flex-1 justify-center"
                                >
                                    <X size={16} /> Ignore
                                </button>
                            </div>

                            {/* Reject modal */}
                            {showRejectModal && (
                                <div className="mt-4 p-4 rounded-xl border-2 border-red-200 bg-red-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle size={16} className="text-red-500" />
                                        <p className="font-bold text-sm text-red-700">Alasan Penolakan</p>
                                    </div>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        className="input-field mb-3"
                                        placeholder="Wajib isi alasan penolakan..."
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleIgnore(selectedMenu.id)} className="btn-danger flex-1 justify-center text-xs">
                                            Konfirmasi Tolak
                                        </button>
                                        <button onClick={() => { setShowRejectModal(false); setRejectReason('') }} className="btn-secondary flex-1 justify-center text-xs">
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <Eye size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih menu dari daftar kiri untuk mereview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
